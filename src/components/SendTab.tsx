import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import {
  formatSatoshis,
  formatFiat,
  parseAmountToSat,
  isValidBitcoinAddress,
  isValidLightningInvoice,
} from '../utils/bitcoin';
import {
  Send,
  Zap,
  Layers,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Coins,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SendTab: React.FC = () => {
  const {
    unit,
    fiat,
    lang,
    onchainBalanceSat,
    lightningBalanceSat,
    feeRates,
    utxos,
    sendTransaction,
    isLocked,
  } = useWallet();

  const t = getTranslation(lang);

  const [recipient, setRecipient] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [feeRateType, setFeeRateType] = useState<'urgent' | 'normal' | 'low' | 'custom'>('normal');
  const [customSatVb, setCustomSatVb] = useState(feeRates.halfHour);
  const [showCoinControl, setShowCoinControl] = useState(false);
  const [selectedUtxos, setSelectedUtxos] = useState<string[]>([]);
  
  // Status feedback
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isLightning = isValidLightningInvoice(recipient);
  const currentSatVb =
    feeRateType === 'urgent'
      ? feeRates.fastest
      : feeRateType === 'normal'
      ? feeRates.halfHour
      : feeRateType === 'low'
      ? feeRates.hour
      : customSatVb;

  // Estimated tx vBytes: ~140 vB for 1 input, 2 outputs Native Segwit
  const estimatedVBytes = 141;
  const estimatedFeeSat = isLightning ? 1 : Math.round(estimatedVBytes * currentSatVb);

  const enteredAmountSat = parseAmountToSat(parseFloat(amountStr) || 0, unit);
  const totalDeductionSat = enteredAmountSat + (isLightning ? 0 : estimatedFeeSat);

  const handleMax = () => {
    if (isLightning) {
      const maxSat = Math.max(0, lightningBalanceSat);
      setAmountStr(unit === 'sat' ? maxSat.toString() : (maxSat / 100_000_000).toString());
    } else {
      const maxSpendSat = Math.max(0, onchainBalanceSat - estimatedFeeSat);
      setAmountStr(unit === 'sat' ? maxSpendSat.toString() : (maxSpendSat / 100_000_000).toString());
    }
  };

  const handleToggleUtxo = (key: string) => {
    setSelectedUtxos((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleProceed = () => {
    setStatusMsg(null);
    if (!recipient.trim()) {
      setStatusMsg({ type: 'error', text: 'Informe um endereço Bitcoin ou invoice Lightning.' });
      return;
    }
    if (enteredAmountSat <= 0) {
      setStatusMsg({ type: 'error', text: 'Informe um valor maior que zero.' });
      return;
    }

    if (!isLightning && !isValidBitcoinAddress(recipient)) {
      setStatusMsg({ type: 'error', text: 'Endereço Bitcoin em formato inválido.' });
      return;
    }

    if (isLightning && enteredAmountSat > lightningBalanceSat) {
      setStatusMsg({ type: 'error', text: 'Saldo Lightning insuficiente para pagar esta invoice.' });
      return;
    }

    if (!isLightning && totalDeductionSat > onchainBalanceSat) {
      setStatusMsg({ type: 'error', text: 'Saldo insuficiente para cobrir o valor e a taxa de mineração.' });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSend = () => {
    setShowConfirmModal(false);
    const result = sendTransaction(
      recipient.trim(),
      enteredAmountSat,
      estimatedFeeSat,
      description.trim(),
      selectedUtxos.length > 0 ? selectedUtxos : undefined
    );

    if (result.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setStatusMsg({
        type: 'success',
        text: `Transação transmitida com sucesso! TXID: ${result.txid?.slice(0, 16)}...`,
      });
      setRecipient('');
      setAmountStr('');
      setDescription('');
      setSelectedUtxos([]);
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'Erro ao transmitir transação.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 text-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.send} Bitcoin / Lightning</h2>
              <p className="text-xs text-slate-400">
                Transmissão direta com suporte a SegWit Nativo e Lightning Network
              </p>
            </div>
          </div>

          {/* Target detection badge */}
          {recipient && (
            <div className="text-xs font-mono">
              {isLightning ? (
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Fatura Lightning Detectada
                </span>
              ) : isValidBitcoinAddress(recipient) ? (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> Endereço On-Chain Válido
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Formato Não Reconhecido
                </span>
              )}
            </div>
          )}
        </div>

        {/* Destination input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>{t.payTo}</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Suporta bech32 (bc1...), Legacy (1/3...), ou Bolt11 (lnbc...)
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Ex: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh ou lnbc..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Description / Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">{t.description}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Pagamento de serviços, transferência para poupança..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">{t.amount}</label>
              <button
                type="button"
                onClick={handleMax}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 font-mono"
              >
                USAR MÁXIMO
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                min="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-16 py-3 font-mono text-base font-bold text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-4 text-xs font-bold text-amber-400 font-mono">
                {unit}
              </span>
            </div>
          </div>

          {/* Converted values display */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-center">
            <span className="text-[11px] text-slate-400">Conversão de Valor:</span>
            <div className="font-mono text-base font-bold text-slate-200 mt-0.5">
              {formatFiat(enteredAmountSat, fiat)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {enteredAmountSat.toLocaleString()} sats &bull; Taxa est.: {estimatedFeeSat} sats
            </div>
          </div>
        </div>

        {/* Mining Fee section (Only for on-chain) */}
        {!isLightning && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.miningFee}</span>
              </label>
              <span className="text-xs font-mono text-slate-400">
                Taxa estimada: <strong className="text-slate-200">{estimatedFeeSat} sats</strong> ({currentSatVb} sat/vB)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFeeRateType('urgent')}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  feeRateType === 'urgent'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">{t.urgent}</div>
                <div className="font-mono text-xs font-semibold text-slate-200 mt-1">
                  {feeRates.fastest} sat/vB
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFeeRateType('normal')}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  feeRateType === 'normal'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">{t.normal}</div>
                <div className="font-mono text-xs font-semibold text-slate-200 mt-1">
                  {feeRates.halfHour} sat/vB
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFeeRateType('low')}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  feeRateType === 'low'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">{t.low}</div>
                <div className="font-mono text-xs font-semibold text-slate-200 mt-1">
                  {feeRates.hour} sat/vB
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFeeRateType('custom')}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  feeRateType === 'custom'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">{t.customFee}</div>
                <div className="font-mono text-xs font-semibold text-slate-200 mt-1">
                  {customSatVb} sat/vB
                </div>
              </button>
            </div>

            {feeRateType === 'custom' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Satoshis por vByte:</span>
                  <span className="font-mono font-bold text-amber-400">{customSatVb} sat/vB</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={customSatVb}
                  onChange={(e) => setCustomSatVb(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Coin Control Toggle */}
        {!isLightning && utxos.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowCoinControl(!showCoinControl)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 py-1"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t.coinControl}</span>
                {selectedUtxos.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                    {selectedUtxos.length} moedas selecionadas
                  </span>
                )}
              </div>
              <span className="text-[11px] text-amber-400">
                {showCoinControl ? 'Ocultar' : 'Configurar'}
              </span>
            </button>

            {showCoinControl && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                <p className="text-[11px] text-slate-400 mb-2">
                  Selecione manualmente as saídas não gastas (UTXOs) para compor a transação:
                </p>
                {utxos.map((u) => {
                  const key = `${u.txid}:${u.vout}`;
                  const isChecked = selectedUtxos.includes(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                          : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-mono">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUtxo(key)}
                          className="accent-amber-500 rounded"
                        />
                        <span>{u.address.slice(0, 10)}...{u.address.slice(-6)}</span>
                        <span className="text-slate-500 text-[10px]">({u.confirmations} conf)</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">
                        {u.amountSat.toLocaleString()} sat
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleProceed}
            disabled={isLocked}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{t.sendTransaction}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Confirmar e Assinar Transação</h3>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs space-y-2.5 font-mono">
              <div>
                <span className="text-slate-400 block font-sans">Destinatário:</span>
                <span className="text-slate-200 break-all">{recipient}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-sans">
                <span className="text-slate-400">Valor líquido:</span>
                <span className="font-mono font-bold text-slate-100">
                  {formatSatoshis(enteredAmountSat, unit)} {unit}
                </span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-slate-400">Taxa de mineração estimada:</span>
                <span className="font-mono text-amber-400">{estimatedFeeSat} sats</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-sans">
                <span className="text-slate-400 font-bold">Total debitado:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  {totalDeductionSat.toLocaleString()} sats ({formatFiat(totalDeductionSat, fiat)})
                </span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
              >
                Confirmar & Transmitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
