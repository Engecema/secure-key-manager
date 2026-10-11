import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  FileCheck,
  FileSignature,
  AlertTriangle,
  Lock,
  Unlock,
  QrCode
} from 'lucide-react';

export const KeystoreTab: React.FC = () => {
  const {
    walletName,
    keystore,
    addresses,
    lang,
    signMessageWithKey,
    verifySignedMessage,
  } = useWallet();

  const t = getTranslation(lang);

  const [showSeed, setShowSeed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Message signing state
  const [signMessageText, setSignMessageText] = useState('');
  const [signAddress, setSignAddress] = useState(addresses[0]?.address || '');
  const [generatedSignature, setGeneratedSignature] = useState('');

  // Message verification state
  const [verifyMessageText, setVerifyMessageText] = useState('');
  const [verifyAddress, setVerifyAddress] = useState('');
  const [verifySignatureText, setVerifySignatureText] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSign = () => {
    if (!signMessageText.trim()) return;
    const sig = signMessageWithKey(signMessageText, signAddress);
    setGeneratedSignature(sig);
  };

  const handleVerify = () => {
    const valid = verifySignedMessage(verifyMessageText, verifyAddress, verifySignatureText);
    setVerificationResult(valid);
  };

  const exportBackupFile = () => {
    const backupData = {
      wallet_type: 'standard',
      seed_type: keystore.seedType,
      keystore: {
        type: 'bip39',
        derivation: keystore.derivationPath,
        xpub: keystore.masterPublicKey,
        seed: keystore.seedPhrase,
      },
      use_encryption: false,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${walletName.replace('.dat', '')}_backup.json`);
    dlAnchor.click();
  };

  const words = keystore.seedPhrase ? keystore.seedPhrase.split(' ') : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Keystore Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.keystore}</h2>
              <p className="text-xs text-slate-400">
                Gerenciamento criptográfico de chaves mestras e sementes mnemônicas
              </p>
            </div>
          </div>

          <button
            onClick={exportBackupFile}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{t.exportBackup}</span>
          </button>
        </div>

        {/* Master Public Key */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">{t.masterPublicKey}</span>
            <span className="text-slate-500 font-mono">Derivação: {keystore.derivationPath}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 break-all">
            <span className="flex-1">{keystore.masterPublicKey}</span>
            <button
              onClick={() => handleCopy(keystore.masterPublicKey, 'xpub')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex-shrink-0"
              title="Copiar Zpub"
            >
              {copiedKey === 'xpub' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Esta chave pública permite que serviços e carteiras frias visualizem seu saldo sem risco de gastar moedas.
          </p>
        </div>

        {/* Seed Phrase / Mnemonic */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300">{t.seedPhrase}</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                BIP39 / 12 Palavras
              </span>
            </div>

            <button
              onClick={() => setShowSeed(!showSeed)}
              className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSeed ? 'Ocultar Palavras' : 'Revelar Palavras'}</span>
            </button>
          </div>

          {showSeed ? (
            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono"
                  >
                    <span className="text-slate-500 w-4 text-[10px]">{idx + 1}.</span>
                    <span className="text-amber-300 font-bold">{word}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <span className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {t.backupNotice}
                </span>
                <button
                  onClick={() => handleCopy(keystore.seedPhrase || '', 'seed')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedKey === 'seed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar Frase</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowSeed(true)}
              className="p-6 bg-slate-950 rounded-xl border border-slate-800 border-dashed text-center text-xs text-slate-500 cursor-pointer hover:border-slate-700 transition-colors"
            >
              Clique para revelar as 12 palavras da semente de recuperação
            </div>
          )}
        </div>
      </div>

      {/* Message Signing & Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sign Message */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
            <FileSignature className="w-4 h-4 text-amber-400" />
            <span>{t.signMessage}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Endereço Assinante:</label>
            <select
              value={signAddress}
              onChange={(e) => setSignAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            >
              {addresses.map((a) => (
                <option key={a.address} value={a.address}>
                  {a.address.slice(0, 14)}... ({a.label})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Mensagem a assinar:</label>
            <textarea
              rows={3}
              value={signMessageText}
              onChange={(e) => setSignMessageText(e.target.value)}
              placeholder="Digite a mensagem (ex: Declaro posse deste endereço...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleSign}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Assinar Criptograficamente
          </button>

          {generatedSignature && (
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-500 block font-sans">Assinatura Gerada:</span>
              <p className="text-amber-300 break-all">{generatedSignature}</p>
            </div>
          )}
        </div>

        {/* Verify Message */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.verifyMessage}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Endereço Bitcoin:</label>
            <input
              type="text"
              value={verifyAddress}
              onChange={(e) => setVerifyAddress(e.target.value)}
              placeholder="bc1q..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Mensagem original:</label>
            <textarea
              rows={2}
              value={verifyMessageText}
              onChange={(e) => setVerifyMessageText(e.target.value)}
              placeholder="Texto original assinado..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Assinatura Base64:</label>
            <input
              type="text"
              value={verifySignatureText}
              onChange={(e) => setVerifySignatureText(e.target.value)}
              placeholder="H..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={handleVerify}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
          >
            Verificar Assinatura
          </button>

          {verificationResult !== null && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                verificationResult
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {verificationResult ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Assinatura Válida! Chave privada confirmada.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Assinatura Inválida ou dados incorretos.</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
