import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import {
  Server,
  Radio,
  Shield,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

export const NetworkTab: React.FC = () => {
  const {
    activeServer,
    torEnabled,
    setTorEnabled,
    switchElectrumServer,
    lang,
  } = useWallet();

  const t = getTranslation(lang);

  const KNOWN_SERVERS = [
    { host: 'electrum.blockstream.info', port: 50002, ssl: true, location: 'Global CDN' },
    { host: 'fortress.qtornado.com', port: 50002, ssl: true, location: 'North America' },
    { host: 'bitcoin.aranguren.org', port: 50002, ssl: true, location: 'Europe' },
    { host: 'electrum.emzy.de', port: 50002, ssl: true, location: 'Germany' },
  ];

  const [customHost, setCustomHost] = useState('');
  const [customPort, setCustomPort] = useState('50002');

  const [consoleLogs] = useState<string[]>([
    'INFO:sk.daemon: Connecting to Electrum network protocol 1.4...',
    'INFO:sk.interface[electrum.blockstream.info]: SSL Handshake succeeded TLSv1.3',
    'INFO:sk.synchronizer: Height updated to tip #894142',
    'INFO:sk.address_synchronizer: Subscribed to 5 addresses (p2wpkh)',
    'INFO:sk.channel_db: Lightning gossip routing table synchronized (14,290 nodes, 62,810 channels)',
    'INFO:sk.network: Fee histogram: fastest=28 sat/vB, halfHour=19 sat/vB',
  ]);

  const handleConnectCustom = () => {
    if (!customHost.trim()) return;
    switchElectrumServer(customHost.trim(), parseInt(customPort) || 50002);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Network Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.network}</h2>
              <p className="text-xs text-slate-400">
                Conexão SPV descentralizada com servidores ElectrumX e nós completos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold">CONECTADO</span>
            <span className="text-slate-500">&bull; {activeServer.pingMs}ms</span>
          </div>
        </div>

        {/* Server list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Servidores Electrum Disponíveis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KNOWN_SERVERS.map((srv) => {
              const isCurrent = activeServer.host === srv.host;
              return (
                <div
                  key={srv.host}
                  onClick={() => switchElectrumServer(srv.host, srv.port)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-200">{srv.host}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1 font-sans">
                    <span>Porta {srv.port} (SSL/TLS)</span>
                    <span>{srv.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tor Proxy Toggle */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{t.torProxy}</div>
              <div className="text-[11px] text-slate-400">
                Roteia todas as consultas Electrum através da rede onion (127.0.0.1:9050)
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={torEnabled}
              onChange={(e) => setTorEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Custom Server input */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-300">Conectar a Servidor Próprio (Node Pessoal)</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customHost}
              onChange={(e) => setCustomHost(e.target.value)}
              placeholder="ex: electrum.meunode.local ou 192.168.1.100"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={customPort}
              onChange={(e) => setCustomPort(e.target.value)}
              placeholder="50002"
              className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleConnectCustom}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Conectar
            </button>
          </div>
        </div>
      </div>

      {/* Network Console Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Console de Comunicação Electrum SPV</span>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-400 max-h-48 overflow-y-auto">
          {consoleLogs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-emerald-400">&gt;</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
