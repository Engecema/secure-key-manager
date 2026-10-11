import React, { useState } from 'react';
import { TransactionItem } from '../types';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import { formatSatoshis, formatFiat } from '../utils/bitcoin';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface TxDetailsModalProps {
  tx: TransactionItem | null;
  onClose: () => void;
}

export const TxDetailsModal: React.FC<TxDetailsModalProps> = ({ tx, onClose }) => {
  const { unit, fiat, lang } = useWallet();
  const t = getTranslation(lang);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!tx) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isReceived = tx.type === 'received' || tx.type === 'lightning_in';
  const isLightning = tx.type.startsWith('lightning');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-lg ${
                isLightning
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : isReceived
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isLightning ? (
                <Zap className="w-5 h-5" />
              ) : isReceived ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{t.txDetails}</h3>
              <p className="text-xs text-slate-400">
                {isLightning ? 'Pagamento Instantâneo Lightning' : 'Transação On-Chain Bitcoin'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount hero */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400">Valor da Operação</div>
          <div
            className={`font-mono text-2xl font-black mt-1 ${
              isReceived ? 'text-emerald-400' : 'text-slate-100'
            }`}
          >
            {isReceived ? '+' : '-'}
            {formatSatoshis(tx.amountSat, unit)} {unit}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            &asymp; {formatFiat(tx.amountSat, fiat)} ({tx.amountSat.toLocaleString()} satoshis)
          </div>
        </div>

        {/* Transaction details table */}
        <div className="space-y-3 text-xs">
          {/* TXID */}
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">{t.txid}:</span>
            <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
              <span className="flex-1">{tx.txid}</span>
              <button
                onClick={() => handleCopy(tx.txid, 'txid')}
                className="text-slate-500 hover:text-amber-400"
              >
                {copiedKey === 'txid' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Endereço / Fatura:</span>
            <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
              <span className="flex-1">{tx.addressOrInvoice}</span>
              <button
                onClick={() => handleCopy(tx.addressOrInvoice, 'addr')}
                className="text-slate-500 hover:text-amber-400"
              >
                {copiedKey === 'addr' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[11px]">{t.status}</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">
                {tx.status === 'confirmed' ? 'Confirmada no bloco' : 'Pendente na Mempool'}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {tx.confirmations} confirmações
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[11px]">{t.fee}</span>
              <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                {tx.feeSat.toLocaleString()} sats
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                &asymp; {formatFiat(tx.feeSat, fiat)}
              </span>
            </div>
          </div>

          {/* Date & Height */}
          <div className="flex justify-between items-center text-slate-400 pt-1 text-[11px]">
            <span>Data: {new Date(tx.timestamp).toLocaleString()}</span>
            {tx.blockHeight && <span>Bloco: #{tx.blockHeight.toLocaleString()}</span>}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
