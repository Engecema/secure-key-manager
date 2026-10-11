import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import { formatSatoshis, formatFiat } from '../utils/bitcoin';
import {
  ListTree,
  Coins,
  Snowflake,
  Copy,
  Check,
  Edit2,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';

export const AddressesTab: React.FC = () => {
  const {
    addresses,
    utxos,
    unit,
    fiat,
    lang,
    toggleFreezeUtxo,
    toggleFreezeAddress,
    updateAddressLabel,
  } = useWallet();

  const t = getTranslation(lang);
  const [subTab, setSubTab] = useState<'addresses' | 'coins'>('addresses');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveLabel = (address: string) => {
    updateAddressLabel(address, tempLabel);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-4">
      {/* Subtab navigation */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('addresses')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'addresses'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTree className="w-4 h-4" />
            <span>Endereços HD ({addresses.length})</span>
          </button>
          <button
            onClick={() => setSubTab('coins')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'coins'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Moedas & UTXOs ({utxos.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          BIP84 Native SegWit &bull; m/84&apos;/0&apos;/0&apos;
        </div>
      </div>

      {/* SubTab 1: Addresses */}
      {subTab === 'addresses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Endereço Bitcoin</th>
                  <th className="py-3 px-4">Derivação</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Rótulo / Descrição</th>
                  <th className="py-3 px-4 text-right">Saldo ({unit})</th>
                  <th className="py-3 px-4 text-center">Tx</th>
                  <th className="py-3 px-4 text-center">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {addresses.map((addr) => {
                  const isCopied = copiedKey === addr.address;
                  const isChange = addr.type === 'change';

                  return (
                    <tr
                      key={addr.address}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        addr.frozen ? 'bg-cyan-950/10 opacity-75' : ''
                      }`}
                    >
                      {/* Address */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-200 font-bold">
                            {addr.address.slice(0, 10)}...{addr.address.slice(-8)}
                          </span>
                          <button
                            onClick={() => handleCopy(addr.address, addr.address)}
                            className="text-slate-500 hover:text-amber-400 transition-colors"
                            title="Copiar endereço"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Derivation path */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {addr.derivationPath}
                      </td>

                      {/* Type badge */}
                      <td className="py-3 px-4 whitespace-nowrap font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                            isChange
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {isChange ? 'Troco' : 'Recebimento'}
                        </span>
                      </td>

                      {/* Label Editor */}
                      <td className="py-3 px-4 font-sans text-slate-300">
                        {editingAddress === addr.address ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={tempLabel}
                              onChange={(e) => setTempLabel(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveLabel(addr.address)}
                              className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded text-[10px]"
                            >
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingAddress(addr.address);
                              setTempLabel(addr.label);
                            }}
                            className="flex items-center space-x-1 cursor-pointer group"
                          >
                            <span className="text-slate-300 group-hover:text-amber-400">
                              {addr.label || '(sem rótulo)'}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100" />
                          </div>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="font-bold text-slate-100">
                          {formatSatoshis(addr.balanceSat, unit)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {formatFiat(addr.balanceSat, fiat)}
                        </div>
                      </td>

                      {/* Tx count */}
                      <td className="py-3 px-4 whitespace-nowrap text-center text-slate-400">
                        {addr.txCount}
                      </td>

                      {/* Freeze toggle */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleFreezeAddress(addr.address)}
                          title={addr.frozen ? 'Descongelar endereço' : 'Congelar endereço'}
                          className={`p-1.5 rounded-md border text-xs transition-colors ${
                            addr.frozen
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-300'
                          }`}
                        >
                          <Snowflake className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Coins / UTXOs */}
      {subTab === 'coins' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {utxos.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Nenhuma saída de transação não gasta (UTXO) disponível no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">Ponto de Saída (Outpoint)</th>
                    <th className="py-3 px-4">Endereço de Destino</th>
                    <th className="py-3 px-4">Script</th>
                    <th className="py-3 px-4 text-center">Confirmações</th>
                    <th className="py-3 px-4 text-right">Valor ({unit})</th>
                    <th className="py-3 px-4 text-center">Congelar / Gastar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {utxos.map((u) => {
                    const key = `${u.txid}:${u.vout}`;
                    const isCopied = copiedKey === key;

                    return (
                      <tr
                        key={key}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          u.isFrozen ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        {/* Outpoint */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-300">
                              {u.txid.slice(0, 10)}...:{u.vout}
                            </span>
                            <button
                              onClick={() => handleCopy(key, key)}
                              className="text-slate-500 hover:text-amber-400"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Address */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                          {u.address.slice(0, 12)}...{u.address.slice(-6)}
                        </td>

                        {/* Script type */}
                        <td className="py-3 px-4 whitespace-nowrap font-sans">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono uppercase">
                            {u.scriptType}
                          </span>
                        </td>

                        {/* Confirmations */}
                        <td className="py-3 px-4 whitespace-nowrap text-center text-slate-300">
                          {u.confirmations} conf
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 whitespace-nowrap text-right font-bold text-amber-400">
                          {formatSatoshis(u.amountSat, unit)}
                          <div className="text-[10px] text-slate-500 font-sans font-normal">
                            {formatFiat(u.amountSat, fiat)}
                          </div>
                        </td>

                        {/* Freeze action */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleFreezeUtxo(u.txid, u.vout)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-sans flex items-center justify-center space-x-1 mx-auto transition-colors ${
                              u.isFrozen
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                            }`}
                          >
                            <Snowflake className="w-3 h-3" />
                            <span>{u.isFrozen ? 'Congelado' : 'Disponível'}</span>
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
      )}
    </div>
  );
};
