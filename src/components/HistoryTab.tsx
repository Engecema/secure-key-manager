import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import { formatSatoshis, formatFiat } from '../utils/bitcoin';
import { TransactionItem } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Search,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface HistoryTabProps {
  onSelectTx: (tx: TransactionItem) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSelectTx }) => {
  const { transactions, unit, fiat, lang } = useWallet();
  const t = getTranslation(lang);

  const [filterType, setFilterType] = useState<'all' | 'received' | 'sent' | 'lightning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'received' && tx.type !== 'received') return false;
    if (filterType === 'sent' && tx.type !== 'sent') return false;
    if (filterType === 'lightning' && !tx.type.startsWith('lightning')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = tx.label?.toLowerCase().includes(q);
      const matchTxid = tx.txid.toLowerCase().includes(q);
      const matchAddr = tx.addressOrInvoice.toLowerCase().includes(q);
      return matchLabel || matchTxid || matchAddr;
    }
    return true;
  });

  const exportHistoryJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `sk_history_${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por descrição, TXID ou endereço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('received')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'received' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recebidos
            </button>
            <button
              onClick={() => setFilterType('sent')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'sent' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Enviados
            </button>
            <button
              onClick={() => setFilterType('lightning')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === 'lightning' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lightning
            </button>
          </div>

          <button
            onClick={exportHistoryJson}
            title="Exportar Histórico JSON"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Transaction list table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">{t.noTransactions}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Descrição / Rótulo</th>
                  <th className="py-3 px-4">Destino / TXID</th>
                  <th className="py-3 px-4 text-right">Quantia ({unit})</th>
                  <th className="py-3 px-4 text-right">Taxa</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((tx) => {
                  const isReceived = tx.type === 'received' || tx.type === 'lightning_in';
                  const isLightning = tx.type.startsWith('lightning');

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTx(tx)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Status Icon */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {tx.status === 'confirmed' ? (
                            <span className="flex items-center space-x-1 text-emerald-400 font-sans text-[11px]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="font-mono text-slate-400">
                                {tx.confirmations > 6 ? '6+' : tx.confirmations} conf
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-amber-400 font-sans text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>Mempool</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-sans">
                        {new Date(tx.timestamp).toLocaleString('pt-BR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Label & Type badge */}
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`p-1 rounded-md ${
                              isLightning
                                ? 'bg-cyan-500/10 text-cyan-400'
                                : isReceived
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isLightning ? (
                              <Zap className="w-3.5 h-3.5" />
                            ) : isReceived ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="font-medium text-slate-200">
                            {tx.label || (isReceived ? 'Depósito recebido' : 'Transferência')}
                          </span>
                        </div>
                      </td>

                      {/* Address or TXID truncated */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                        <span className="text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-400">
                          {tx.txid.slice(0, 8)}...{tx.txid.slice(-8)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div
                          className={`font-bold ${
                            isReceived ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isReceived ? '+' : '-'}
                          {formatSatoshis(tx.amountSat, unit)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {formatFiat(tx.amountSat, fiat)}
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-4 whitespace-nowrap text-right text-slate-400">
                        <span className="text-slate-400">{tx.feeSat.toLocaleString()}</span>{' '}
                        <span className="text-[10px] text-slate-500 font-sans">sat</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTx(tx);
                          }}
                          className="p-1 rounded text-slate-500 group-hover:text-amber-400 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
