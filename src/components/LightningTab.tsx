import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import { formatSatoshis, formatFiat } from '../utils/bitcoin';
import {
  Zap,
  Plus,
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';

export const LightningTab: React.FC = () => {
  const {
    channels,
    unit,
    fiat,
    lang,
    lightningBalanceSat,
    onchainBalanceSat,
    openLightningChannel,
    closeLightningChannel,
  } = useWallet();

  const t = getTranslation(lang);

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [peerAlias, setPeerAlias] = useState('');
  const [peerPubkey, setPeerPubkey] = useState('');
  const [capacitySat, setCapacitySat] = useState('200000');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalCapacitySat = channels.reduce((sum, c) => sum + c.capacitySat, 0);
  const totalRemoteSat = channels.reduce((sum, c) => sum + c.remoteBalanceSat, 0);

  const localPercent = totalCapacitySat > 0 ? (lightningBalanceSat / totalCapacitySat) * 100 : 0;
  const remotePercent = totalCapacitySat > 0 ? (totalRemoteSat / totalCapacitySat) * 100 : 0;

  const handleOpenChannel = () => {
    setErrorMsg(null);
    const cap = parseInt(capacitySat, 10);
    if (!peerPubkey.trim()) {
      setErrorMsg('Informe a chave pública do nó peer.');
      return;
    }
    if (isNaN(cap) || cap < 20000) {
      setErrorMsg('Capacidade mínima do canal é de 20.000 satoshis.');
      return;
    }

    const res = openLightningChannel(peerAlias, peerPubkey, cap);
    if (res.success) {
      setShowOpenModal(false);
      setPeerAlias('');
      setPeerPubkey('');
    } else {
      setErrorMsg(res.error || 'Erro ao abrir canal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Liquidity Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.channels}</h2>
              <p className="text-xs text-slate-400">
                Rede de pagamentos instantâneos off-chain com roteamento onion
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOpenModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.openChannel}</span>
          </button>
        </div>

        {/* Liquidity Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">
                {t.localCapacity} (Pode Enviar):{' '}
                <strong className="text-cyan-300 font-mono">
                  {formatSatoshis(lightningBalanceSat, unit)} {unit}
                </strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
              <span className="text-slate-400">
                {t.remoteCapacity} (Pode Receber):{' '}
                <strong className="text-slate-300 font-mono">
                  {formatSatoshis(totalRemoteSat, unit)} {unit}
                </strong>
              </span>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${localPercent}%` }}
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full transition-all duration-500"
            />
            <div
              style={{ width: `${remotePercent}%` }}
              className="bg-slate-700 h-full transition-all duration-500"
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>{localPercent.toFixed(1)}% local</span>
            <span>Total da Rede: {formatSatoshis(totalCapacitySat, unit)} {unit} ({formatFiat(totalCapacitySat, fiat)})</span>
            <span>{remotePercent.toFixed(1)}% remoto</span>
          </div>
        </div>
      </div>

      {/* Channels List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Canais Ativos ({channels.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">Gossip & Routing OK</span>
        </div>

        {channels.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Nenhum canal Lightning aberto. Abra um canal para enviar pagamentos instantâneos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Peer Remoto</th>
                  <th className="py-3 px-4">Capacidade Total</th>
                  <th className="py-3 px-4">Saldo Local</th>
                  <th className="py-3 px-4">Saldo Remoto</th>
                  <th className="py-3 px-4">Taxa Roteamento</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {channels.map((ch) => {
                  const chLocalPercent = (ch.localBalanceSat / ch.capacitySat) * 100;
                  return (
                    <tr key={ch.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-slate-200">{ch.peerAlias}</div>
                        <div className="text-[10px] text-slate-500">{ch.peerPubkey.slice(0, 16)}...</div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-100">
                        {formatSatoshis(ch.capacitySat, unit)}
                      </td>

                      <td className="py-3 px-4 text-cyan-400 font-bold">
                        {formatSatoshis(ch.localBalanceSat, unit)}
                        <div className="text-[10px] text-slate-500 font-sans font-normal">
                          {chLocalPercent.toFixed(0)}%
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {formatSatoshis(ch.remoteBalanceSat, unit)}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {ch.feePpm} ppm
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans">
                          {ch.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => closeLightningChannel(ch.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[11px] font-sans font-semibold border border-slate-700 transition-colors"
                        >
                          {t.closeChannel}
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

      {/* Open Channel Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-cyan-400">
              <Zap className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Abrir Novo Canal Lightning</h3>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nome / Alias do Nó:</label>
                <input
                  type="text"
                  value={peerAlias}
                  onChange={(e) => setPeerAlias(e.target.value)}
                  placeholder="Ex: ACINQ, Kraken LND, Boltz..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Chave Pública do Peer (66 caracteres hex):</label>
                <input
                  type="text"
                  value={peerPubkey}
                  onChange={(e) => setPeerPubkey(e.target.value)}
                  placeholder="03864ef025fde8fb587d989186ce6a4a186..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Capacidade do Canal (Satoshis):</label>
                <input
                  type="number"
                  value={capacitySat}
                  onChange={(e) => setCapacitySat(e.target.value)}
                  placeholder="200000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500">
                  Saldo on-chain disponível: {onchainBalanceSat.toLocaleString()} sats
                </span>
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenChannel}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                Financiar & Abrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
