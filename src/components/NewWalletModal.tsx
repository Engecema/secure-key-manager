import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { WalletType } from '../types';
import { generateMnemonic } from '../utils/bitcoin';
import {
  X,
  Plus,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewWalletModal: React.FC<NewWalletModalProps> = ({ isOpen, onClose }) => {
  const { createNewWallet } = useWallet();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [walletName, setWalletName] = useState('nova_carteira.dat');
  const [walletType, setWalletType] = useState<WalletType>('segwit_native');
  const [isRestore, setIsRestore] = useState(false);
  const [generatedSeed, setGeneratedSeed] = useState('');
  const [customSeedInput, setCustomSeedInput] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    if (!isRestore) {
      const seed = generateMnemonic(12);
      setGeneratedSeed(seed);
    }
    setStep(2);
  };

  const handleFinish = () => {
    const finalSeed = isRestore ? customSeedInput.trim() : generatedSeed;
    createNewWallet(walletName, walletType, finalSeed, passphrase);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onClose();
    setStep(1);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(generatedSeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const words = generatedSeed ? generatedSeed.split(' ') : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Assistente de Carteira Electrum / SK
              </h3>
              <p className="text-xs text-slate-400">Etapa {step} de 3</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select Type & Name */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Nome do Arquivo da Carteira:</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="minha_carteira.dat"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-semibold">Tipo de Carteira:</label>
              <div className="space-y-2">
                <label
                  onClick={() => setWalletType('segwit_native')}
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition-colors ${
                    walletType === 'segwit_native'
                      ? 'bg-amber-500/10 border-amber-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="walletType"
                    checked={walletType === 'segwit_native'}
                    onChange={() => {}}
                    className="accent-amber-500 mt-0.5 mr-2.5"
                  />
                  <div>
                    <strong className="block text-slate-200">SegWit Nativo (BIP84 / bech32)</strong>
                    <span className="text-[11px] text-slate-500">
                      Endereços iniciados com bc1q. Menores taxas na rede e compatível com Lightning.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setWalletType('multisig_2_of_3')}
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition-colors ${
                    walletType === 'multisig_2_of_3'
                      ? 'bg-amber-500/10 border-amber-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="walletType"
                    checked={walletType === 'multisig_2_of_3'}
                    onChange={() => {}}
                    className="accent-amber-500 mt-0.5 mr-2.5"
                  />
                  <div>
                    <strong className="block text-slate-200">Multiasinatura (Multi-Sig 2 de 3)</strong>
                    <span className="text-[11px] text-slate-500">
                      Requer aprovação de múltiplos cossignatários para movimentar fundos.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-4 border-t border-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="restoreOption"
                  checked={!isRestore}
                  onChange={() => setIsRestore(false)}
                  className="accent-amber-500"
                />
                <span>Criar uma nova semente</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="restoreOption"
                  checked={isRestore}
                  onChange={() => setIsRestore(true)}
                  className="accent-amber-500"
                />
                <span>Já possuo uma semente (Restaurar)</span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-amber-500/20"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Seed phrase */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            {!isRestore ? (
              <>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    Anote as 12 palavras em papel. Elas são a única chave de recuperação da sua carteira.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {words.map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 font-mono text-[11px] flex items-center space-x-1.5"
                    >
                      <span className="text-slate-500">{idx + 1}.</span>
                      <span className="text-amber-300 font-bold">{w}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopySeed}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border border-slate-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Palavras Copiadas!' : 'Copiar Palavras'}</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold">
                  Insira as 12 ou 24 palavras da semente (separadas por espaço):
                </label>
                <textarea
                  rows={4}
                  value={customSeedInput}
                  onChange={(e) => setCustomSeedInput(e.target.value)}
                  placeholder="abandon ability able about above..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
              >
                <span>Avançar para Segurança</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Passphrase & Confirmation */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold">
                Frase Secreta de Extensão / Passphrase (Opcional):
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Deixe em branco caso não utilize a 13ª palavra BIP39"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500">
                A extensão atua como um cofre oculto ('plausible deniability'). Cada palavra gera uma carteira completamente diferente.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Nome:</span>
                <span className="font-mono text-slate-200 font-bold">{walletName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Padrão de Derivação:</span>
                <span className="font-mono text-amber-400">m/84&apos;/0&apos;/0&apos;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Formato:</span>
                <span className="font-mono text-emerald-400 font-bold">Native SegWit (bech32)</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar & Inicializar Carteira</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
