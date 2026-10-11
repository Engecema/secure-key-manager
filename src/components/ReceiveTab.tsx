import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import {
  formatSatoshis,
  formatFiat,
  parseAmountToSat,
  generateQrMatrix,
} from '../utils/bitcoin';
import {
  QrCode,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Coins,
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ReceiveTab: React.FC = () => {
  const {
    unit,
    fiat,
    lang,
    addresses,
    createReceiveRequest,
  } = useWallet();

  const t = getTranslation(lang);

  const [mode, setMode] = useState<'onchain' | 'lightning'>('onchain');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [copied, setCopied] = useState(false);

  // Default to first unused receive address
  const activeAddress =
    addresses.find((a) => a.type === 'receiving' && a.balanceSat === 0)?.address ||
    addresses[0]?.address ||
    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

  const [generatedLightningInvoice, setGeneratedLightningInvoice] = useState<string | null>(null);

  const amountSat = parseAmountToSat(parseFloat(requestedAmount) || 0, unit);

  // Generate payment URI
  let paymentUri = activeAddress;
  if (mode === 'onchain') {
    const params: string[] = [];
    if (amountSat > 0) params.push(`amount=${(amountSat / 100_000_000).toFixed(8)}`);
    if (memo.trim()) params.push(`message=${encodeURIComponent(memo)}`);
    if (params.length > 0) paymentUri = `bitcoin:${activeAddress}?${params.join('&')}`;
  } else {
    paymentUri = generatedLightningInvoice || `lnbc${amountSat || 1000}0n1...crie_uma_cobranca`;
  }

  const handleGenerateLightning = () => {
    const req = createReceiveRequest(amountSat || 50000, memo, true);
    setGeneratedLightningInvoice(req.addressOrInvoice);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mode === 'lightning' && generatedLightningInvoice ? generatedLightningInvoice : activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrMatrix = generateQrMatrix(paymentUri, 25);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
        {/* Header and Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              <span>{t.receive} Bitcoin / Lightning</span>
            </h2>
            <p className="text-xs text-slate-400">
              Gere faturas instantâneas ou receba diretamente no endereço SegWit
            </p>
          </div>

          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setMode('onchain')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'onchain'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>On-Chain (SegWit)</span>
            </button>
            <button
              onClick={() => setMode('lightning')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'lightning'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Lightning (Bolt11)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* QR Code and display box */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="bg-white p-3.5 rounded-2xl shadow-xl shadow-amber-500/5">
              <svg
                viewBox="0 0 25 25"
                className="w-52 h-52 sm:w-60 sm:h-60"
                shapeRendering="crispEdges"
              >
                {qrMatrix.map((row, rIdx) =>
                  row.map((cell, cIdx) =>
                    cell ? (
                      <rect
                        key={`${rIdx}-${cIdx}`}
                        x={cIdx}
                        y={rIdx}
                        width="1"
                        height="1"
                        fill="#090d16"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>

            <div className="text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                {mode === 'onchain' ? 'Endereço Nativo SegWit' : 'Fatura Lightning'}
              </span>
              <p className="text-xs font-mono text-slate-300 break-all px-2 max-w-sm">
                {mode === 'lightning' && generatedLightningInvoice
                  ? `${generatedLightningInvoice.slice(0, 24)}...${generatedLightningInvoice.slice(-16)}`
                  : activeAddress}
              </p>
            </div>

            <div className="flex space-x-2 w-full max-w-xs">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-amber-500/10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copy}</span>
              </button>
            </div>
          </div>

          {/* Configuration form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Quantia Solicitada (Opcional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-16 py-3 font-mono text-base font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 text-xs font-bold text-amber-400 font-mono">
                  {unit}
                </span>
              </div>
              {amountSat > 0 && (
                <div className="text-xs text-slate-400 font-mono">
                  &asymp; {formatFiat(amountSat, fiat)} ({amountSat.toLocaleString()} sats)
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Descrição / Rótulo da Cobrança
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Ex: Venda de produto #104..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {mode === 'lightning' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateLightning}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Gerar Cobrança Lightning</span>
                </button>
              </div>
            )}

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-slate-300 font-medium">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Informações de Recebimento</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400">
                <li>Endereços bech32 garantem taxas mínimas para quem envia.</li>
                <li>Este endereço pertence exclusivamente à sua carteira HD.</li>
                <li>O Electrum gerencia novos endereços de recebimento automaticamente.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
