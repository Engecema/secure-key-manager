import React, { useState } from 'react';
import {
  Server,
  Activity,
  Cpu,
  Shield,
  Layers,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';

export const NodeDashboard: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState(104820);
  const [hashRate, setHashRate] = useState('14.82 MH/s');
  const [miningActive, setMiningActive] = useState(false);
  const [rpcCommand, setRpcCommand] = useState('getblockchaininfo');
  const [rpcResponse, setRpcResponse] = useState<string | null>(JSON.stringify({
    chain: 'regtest',
    blocks: 104820,
    headers: 104820,
    bestblockhash: '000000004a8b7921fcb4e3f19e487198ba29a27e7ff',
    difficulty: 0.000004,
    mediantime: 1774892100,
    verificationprogress: 1.0,
    initialblockdownload: false,
    chainwork: '000000000000000000000000000000000000000000000000000000104820',
    size_on_disk: 142859102,
    pruned: false,
  }, null, 2));

  const handleRunRpc = () => {
    if (rpcCommand === 'getpeerinfo') {
      setRpcResponse(JSON.stringify([
        { id: 1, addr: '127.0.0.1:8333', subver: '/BitXCore:0.21.0/', inbound: true, pingtime: 0.001 },
        { id: 2, addr: '192.168.1.100:8333', subver: '/BitXCore:0.21.0/', inbound: false, pingtime: 0.004 }
      ], null, 2));
    } else if (rpcCommand === 'getmininginfo') {
      setRpcResponse(JSON.stringify({
        blocks: blockHeight,
        difficulty: 0.000004,
        networkhashps: 15540000,
        pooledtx: 0,
        chain: 'regtest'
      }, null, 2));
    } else if (rpcCommand === 'generatetoaddress') {
      setBlockHeight(b => b + 1);
      setRpcResponse(JSON.stringify({
        hash: `00000000${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
        block: blockHeight + 1,
        reward: '50.00000000 BTXC',
      }, null, 2));
    } else {
      setRpcResponse(JSON.stringify({
        chain: 'regtest',
        blocks: blockHeight,
        headers: blockHeight,
        node_status: 'online',
        uptime_seconds: 84920,
        version: 'v0.21.0-btxc',
      }, null, 2));
    }
  };

  const toggleMining = () => {
    setMiningActive(!miningActive);
    if (!miningActive) {
      setBlockHeight(b => b + 1);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5d9ce] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#172522] px-3 py-1 text-xs font-bold text-[#b9ef6b]">
            <Server className="h-3.5 w-3.5" /> BitX Core Daemon v0.21.0
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[#172522]">Painel do Nó & Monitoramento RPC</h1>
          <p className="text-xs text-[#586761]">
            Endereço local: <strong>127.0.0.1:8332</strong> · Protocolo BTXC Regtest
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            Nó Sincronizado
          </div>

          <button
            onClick={toggleMining}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
              miningActive
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-[#172522] text-[#b9ef6b] hover:bg-[#204336]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{miningActive ? 'Parar Mineração Local' : 'Minerar Bloco de Teste'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#d5d9ce] bg-white p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#586761]">ALTURA DO BLOCO</div>
          <div className="mt-1 font-mono text-2xl font-bold text-[#172522]">
            #{blockHeight.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600">Tempo médio: 2.5 seg (regtest)</div>
        </div>

        <div className="rounded-xl border border-[#d5d9ce] bg-white p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#586761]">TAXA DE HASH</div>
          <div className="mt-1 font-mono text-2xl font-bold text-[#172522]">{hashRate}</div>
          <div className="text-[10px] text-[#586761]">SHA-256d Nativo</div>
        </div>

        <div className="rounded-xl border border-[#d5d9ce] bg-white p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#586761]">PARES CONECTADOS</div>
          <div className="mt-1 font-mono text-2xl font-bold text-[#172522]">8 nós ativos</div>
          <div className="text-[10px] text-[#586761]">Topologia P2P</div>
        </div>

        <div className="rounded-xl border border-[#d5d9ce] bg-white p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#586761]">COTAÇÃO ESTIMADA</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-700">R$ 0,0842</div>
          <div className="text-[10px] text-emerald-600">+ 4.12% nas últimas 24h</div>
        </div>
      </div>

      {/* RPC Console */}
      <div className="rounded-2xl border border-[#d5d9ce] bg-[#111827] p-6 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#b9ef6b]" />
            <h3 className="text-sm font-bold font-mono text-gray-200">Terminal RPC BitX Core</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">auth: rpcuser / rpcpassword</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['getblockchaininfo', 'getpeerinfo', 'getmininginfo', 'generatetoaddress'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setRpcCommand(cmd);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono transition ${
                rpcCommand === cmd
                  ? 'bg-[#b9ef6b] text-[#172522] font-bold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cmd}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 font-mono text-xs text-gray-200">
            <span className="text-[#b9ef6b] mr-2">&gt;</span>
            <input
              type="text"
              value={rpcCommand}
              onChange={(e) => setRpcCommand(e.target.value)}
              className="bg-transparent focus:outline-none w-10/12 text-white"
            />
          </div>
          <button
            onClick={handleRunRpc}
            className="flex items-center gap-1 rounded-lg bg-[#b9ef6b] px-4 py-2 text-xs font-bold text-[#172522] hover:bg-emerald-400"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Executar
          </button>
        </div>

        {rpcResponse && (
          <div className="mt-4">
            <pre className="max-h-64 overflow-auto rounded-lg bg-black/60 p-4 font-mono text-xs text-emerald-400 border border-gray-800">
              {rpcResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
