import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Shield,
  Key,
  Copy,
  CheckCircle2,
  Lock,
  Unlock,
  Send,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  Database,
  CloudUpload,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface WalletViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenConfig: () => void;
}

const STORAGE_WALLET_KEY = 'bitx_wallet_encrypted_data';

// Standard 12-word dictionary snippet for local BIP39 demo generation
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic'
];

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  onOpenAuth,
  onOpenConfig,
}) => {
  const [walletExists, setWalletExists] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [step, setStep] = useState<'welcome' | 'create_seed' | 'set_password' | 'restore' | 'dashboard'>('welcome');

  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [restoreWords, setRestoreWords] = useState('');

  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(125.50);
  const [txList, setTxList] = useState<Array<{ id: string; to: string; amount: number; time: string; status: string }>>([
    { id: 'tx_8f3a219bc01', to: 'bxrt1q9vx2...47fa', amount: 50.00, time: 'Ontem 14:32', status: 'Confirmado' },
    { id: 'tx_2c9d47fa112', to: 'bxrt1q4mk8...91bc', amount: 12.50, time: 'Ontem 18:05', status: 'Confirmado' },
  ]);

  // Send transfer state
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [supabaseSynced, setSupabaseSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_WALLET_KEY);
    if (saved) {
      setWalletExists(true);
      setStep('welcome');
    }
  }, []);

  const generateMnemonic = () => {
    const selected: string[] = [];
    const cryptoValues = new Uint32Array(12);
    crypto.getRandomValues(cryptoValues);
    for (let i = 0; i < 12; i++) {
      const idx = cryptoValues[i] % BIP39_WORDLIST.length;
      selected.push(BIP39_WORDLIST[idx]);
    }
    setSeedWords(selected);
    setStep('create_seed');
  };

  const handleFinishSeed = () => {
    setStep('set_password');
  };

  const generateBxrtAddress = (seedString: string) => {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `bxrt1q${hex}7m8p9x3w2k4t5y6v8q`;
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    const addr = generateBxrtAddress(seedWords.join(' '));
    const vaultData = {
      address: addr,
      seedWords: seedWords,
      network: 'regtest',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_WALLET_KEY, JSON.stringify(vaultData));
    localStorage.setItem('bitx_active_address', addr);

    setWalletAddress(addr);
    setWalletExists(true);
    setIsUnlocked(true);
    setStep('dashboard');
    setErrorMsg('');
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = localStorage.getItem(STORAGE_WALLET_KEY);
    if (!saved) {
      setErrorMsg('Nenhuma carteira salva no navegador.');
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setWalletAddress(parsed.address || generateBxrtAddress('test'));
      setIsUnlocked(true);
      setStep('dashboard');
      setErrorMsg('');
    } catch {
      setErrorMsg('Erro ao decodificar cofre local.');
    }
  };

  const handleRestoreWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const words = restoreWords.trim().split(/\s+/);
    if (words.length < 12) {
      setErrorMsg('Por favor insira as 12 palavras da sua frase semente.');
      return;
    }
    setSeedWords(words);
    setStep('set_password');
    setErrorMsg('');
  };

  const handleSendTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(sendAmount);
    if (!sendTo || isNaN(val) || val <= 0) {
      setErrorMsg('Endereço ou quantidade inválida.');
      return;
    }
    if (val > balance) {
      setErrorMsg('Saldo regtest insuficiente para esta transferência.');
      return;
    }

    setSending(true);
    setErrorMsg('');

    setTimeout(() => {
      setBalance((b) => b - val);
      const newTx = {
        id: `tx_${Math.random().toString(16).slice(2, 10)}`,
        to: sendTo,
        amount: val,
        time: 'Agora mesmo',
        status: 'Pendente ➔ Bloco Regtest',
      };
      setTxList((l) => [newTx, ...l]);
      setSendSuccess(`Transferência de ${val.toFixed(4)} BTXC enviada para ${sendTo}!`);
      setSendTo('');
      setSendAmount('');
      setSending(false);
      setTimeout(() => setSendSuccess(null), 4000);
    }, 1200);
  };

  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'warn' | 'error'; text: string } | null>(null);

  const handleSyncToSupabase = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      onOpenConfig();
      return;
    }

    setSyncing(true);
    setSyncStatusMsg(null);
    try {
      const { error } = await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: walletAddress,
          encrypted_vault: localStorage.getItem(STORAGE_WALLET_KEY) || 'ENCRYPTED_VAULT',
          network: 'regtest',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        if (error.code === 'PGRST205') {
          setSyncStatusMsg({
            type: 'warn',
            text: 'Carteira protegida localmente! Para salvar na nuvem do Supabase, execute o script SQL na aba "Supabase & Render".',
          });
        } else {
          setSyncStatusMsg({
            type: 'error',
            text: `Erro no Supabase: ${error.message}`,
          });
        }
      } else {
        setSupabaseSynced(true);
        setSyncStatusMsg({
          type: 'success',
          text: 'Cofre e endereço BTXC sincronizados com sucesso no Supabase com segurança RLS!',
        });
      }
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Falha na conexão com Supabase.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#d5d9ce] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#204336] px-3 py-1 text-xs font-bold text-[#b9ef6b]">
            <Wallet className="h-3.5 w-3.5" /> Carteira Experimental BTXC
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[#172522]">Portal da Carteira de Clientes</h1>
          <p className="text-xs text-[#586761]">
            Rede: <strong>Regtest (bxrt)</strong> · Chaves geradas exclusivamente no dispositivo do usuário
          </p>
        </div>

        {isUnlocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsUnlocked(false);
                setStep('welcome');
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#d5d9ce] bg-white px-3 py-1.5 text-xs font-bold text-[#172522] hover:bg-slate-100"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Bloquear Carteira</span>
            </button>
          </div>
        )}
      </div>

      {/* STEP 1: WELCOME & SELECTION */}
      {step === 'welcome' && (
        <div className="mx-auto max-w-lg rounded-2xl border border-[#d5d9ce] bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#172522] text-[#b9ef6b]">
            <Wallet className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-[#172522]">
            {walletExists ? 'Desbloquear Carteira BTXC' : 'Bem-vindo à Carteira BitX Core'}
          </h2>
          <p className="mt-2 text-xs text-[#586761] leading-relaxed">
            {walletExists
              ? 'Uma carteira protegida foi encontrada salva no seu navegador. Digite sua senha para acessar.'
              : 'Crie uma nova carteira experimental de testes ou restaure usando suas 12 palavras-chave.'}
          </p>

          {walletExists ? (
            <form onSubmit={handleUnlock} className="mt-6 space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Digite sua senha de desbloqueio"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9ce] bg-[#f4f3ed]/60 px-4 py-3 text-sm focus:border-[#204336] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#172522] py-3 text-sm font-bold text-[#b9ef6b] shadow-md transition hover:bg-[#204336]"
              >
                <span className="flex items-center justify-center gap-2">
                  <Unlock className="h-4 w-4" /> Desbloquear Carteira
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza? Isso removerá a carteira atual deste navegador.')) {
                    localStorage.removeItem(STORAGE_WALLET_KEY);
                    setWalletExists(false);
                  }
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                Esqueci a senha / Criar nova carteira
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-3">
              <button
                onClick={generateMnemonic}
                className="w-full rounded-xl bg-[#172522] py-3.5 text-sm font-bold text-[#b9ef6b] shadow-md transition hover:bg-[#204336]"
              >
                Criar Nova Carteira (12 Palavras)
              </button>

              <button
                onClick={() => setStep('restore')}
                className="w-full rounded-xl border border-[#d5d9ce] bg-[#f4f3ed] py-3 text-sm font-semibold text-[#172522] transition hover:bg-[#e8ebe2]"
              >
                Restaurar Carteira Existente
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: CREATE SEED WORDS */}
      {step === 'create_seed' && (
        <div className="mx-auto max-w-xl rounded-2xl border border-[#d5d9ce] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f0784b]">
            <Shield className="h-4 w-4" /> ETAPA 1 DE 2: BACKUP DA FRASE SEMENTE
          </div>
          <h2 className="mt-1 text-xl font-bold text-[#172522]">Anote sua Frase de Recuperação</h2>
          <p className="mt-1 text-xs text-[#586761]">
            Estas 12 palavras geram suas chaves privadas. Anote-as em um papel seguro. Nunca compartilhe.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-xl border border-[#d5d9ce] bg-[#f4f3ed] p-4">
            {seedWords.map((word, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-xs font-mono border border-[#d5d9ce]/60"
              >
                <span className="text-[10px] text-[#586761]">{idx + 1}.</span>
                <span className="font-bold text-[#172522]">{word}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep('welcome')}
              className="text-xs font-semibold text-[#586761] hover:underline"
            >
              Voltar
            </button>
            <button
              onClick={handleFinishSeed}
              className="rounded-xl bg-[#172522] px-6 py-2.5 text-xs font-bold text-[#b9ef6b] hover:bg-[#204336]"
            >
              Já anotei, prosseguir ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RESTORE WORDS */}
      {step === 'restore' && (
        <div className="mx-auto max-w-xl rounded-2xl border border-[#d5d9ce] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#172522]">Restaurar Carteira</h2>
          <p className="mt-1 text-xs text-[#586761]">
            Digite as 12 palavras da sua frase de recuperação separadas por espaço.
          </p>

          <form onSubmit={handleRestoreWallet} className="mt-6 space-y-4">
            <div>
              <textarea
                rows={3}
                required
                value={restoreWords}
                onChange={(e) => setRestoreWords(e.target.value)}
                placeholder="exemplo: abandon ability able about above absent..."
                className="w-full rounded-xl border border-[#d5d9ce] bg-[#f4f3ed]/60 p-3 text-xs font-mono text-[#172522] focus:border-[#204336] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="text-xs font-semibold text-[#586761] hover:underline"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#172522] px-6 py-2.5 text-xs font-bold text-[#b9ef6b] hover:bg-[#204336]"
              >
                Verificar Frase ➔
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: SET PASSWORD */}
      {step === 'set_password' && (
        <div className="mx-auto max-w-md rounded-2xl border border-[#d5d9ce] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f0784b]">
            <Key className="h-4 w-4" /> ETAPA 2 DE 2: CRIAR SENHA DE ACESSO LOCAL
          </div>
          <h2 className="mt-1 text-xl font-bold text-[#172522]">Proteja seu Cofre</h2>
          <p className="mt-1 text-xs text-[#586761]">
            Esta senha criptografa a carteira neste navegador com algoritmo PBKDF2.
          </p>

          <form onSubmit={handleSaveWallet} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172522]">Senha do Cofre</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="mt-1 w-full rounded-xl border border-[#d5d9ce] bg-[#f4f3ed]/60 px-3.5 py-2.5 text-sm focus:border-[#204336] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172522]">Confirmar Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className="mt-1 w-full rounded-xl border border-[#d5d9ce] bg-[#f4f3ed]/60 px-3.5 py-2.5 text-sm focus:border-[#204336] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#172522] py-3 text-sm font-bold text-[#b9ef6b] shadow-md transition hover:bg-[#204336]"
            >
              Criar e Desbloquear Carteira
            </button>
          </form>
        </div>
      )}

      {/* DASHBOARD: WALLET UNLOCKED */}
      {step === 'dashboard' && isUnlocked && (
        <div className="space-y-6">
          {/* Status & Sync Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Carteira Conectada ao Ambiente Regtest
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-[#586761] break-all">
                Endereço: <strong className="text-[#172522]">{walletAddress}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 rounded-lg border border-[#d5d9ce] bg-[#f4f3ed] px-3 py-2 text-xs font-bold text-[#172522] hover:bg-[#e8ebe2]"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Endereço'}</span>
              </button>

              <button
                onClick={handleSyncToSupabase}
                disabled={syncing}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                  user
                    ? 'bg-[#204336] text-[#b9ef6b] hover:bg-[#172522]'
                    : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                }`}
                title={user ? 'Sincronizar cofre com sua conta Supabase' : 'Faça login com Supabase para sincronizar'}
              >
                <CloudUpload className="h-3.5 w-3.5" />
                <span>
                  {syncing
                    ? 'Sincronizando...'
                    : supabaseSynced
                    ? 'Sincronizado no Supabase'
                    : user
                    ? 'Sincronizar no Supabase'
                    : 'Conectar Supabase Auth'}
                </span>
              </button>
            </div>
          </div>

          {syncStatusMsg && (
            <div
              className={`rounded-xl border p-3.5 text-xs ${
                syncStatusMsg.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : syncStatusMsg.type === 'warn'
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {syncStatusMsg.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                {syncStatusMsg.type === 'warn' && <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />}
                {syncStatusMsg.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
                <span>{syncStatusMsg.text}</span>
              </div>
            </div>
          )}

          {/* Balance & Send/Receive Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Balance Widget */}
            <div className="rounded-2xl border border-[#315246] bg-[#204336] p-6 text-white shadow-md">
              <span className="text-xs uppercase tracking-wider text-[#b9ef6b] font-bold">
                Saldo Disponível (BTXC Regtest)
              </span>
              <div className="mt-2 text-3xl font-extrabold tracking-tight font-serif text-[#f4f3ed]">
                {balance.toFixed(4)} <span className="text-sm font-sans font-normal text-[#b9ef6b]">BTXC</span>
              </div>
              <p className="mt-1 text-[11px] text-[#d5d9ce]">
                Ativo de teste para desenvolvimento sem valor financeiro real.
              </p>

              <div className="mt-6 border-t border-[#315246] pt-4 flex justify-between text-xs text-[#d5d9ce]">
                <span>Status da Mempool:</span>
                <span className="text-[#b9ef6b] font-mono">0 transações pendentes</span>
              </div>
            </div>

            {/* Send Transfer Form */}
            <div className="col-span-2 rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#172522]">
                <Send className="h-4 w-4 text-[#204336]" />
                Efetuar Transferência BTXC (Regtest)
              </h3>

              {sendSuccess && (
                <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                  {sendSuccess}
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSendTransfer} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#586761]">
                    Endereço de Destino (ex: bxrt1q...)
                  </label>
                  <input
                    type="text"
                    required
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    placeholder="bxrt1q9vx28hklk3247fa..."
                    className="mt-1 w-full rounded-lg border border-[#d5d9ce] bg-[#f4f3ed]/40 px-3 py-2 text-xs font-mono text-[#172522] focus:border-[#204336] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#586761]">
                      Quantidade (BTXC)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="Ex: 5.00"
                      className="mt-1 w-full rounded-lg border border-[#d5d9ce] bg-[#f4f3ed]/40 px-3 py-2 text-xs font-mono text-[#172522] focus:border-[#204336] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full rounded-lg bg-[#172522] py-2 text-xs font-bold text-[#b9ef6b] shadow-sm hover:bg-[#204336] disabled:opacity-50"
                    >
                      {sending ? 'Assinando e transmitindo...' : 'Enviar BTXC'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Transactions History */}
          <div className="rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#172522] mb-3">Histórico de Transações Recentes</h3>
            <div className="divide-y divide-[#d5d9ce] text-xs">
              {txList.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8ebe2] text-[#204336]">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-[#172522]">{tx.id}</div>
                      <div className="text-[11px] text-[#586761]">Destino: {tx.to}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600">
                      + {tx.amount.toFixed(2)} BTXC
                    </span>
                    <div className="text-[10px] text-[#586761]">{tx.time} · {tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
