import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { HistoryTab } from './components/HistoryTab';
import { SendTab } from './components/SendTab';
import { ReceiveTab } from './components/ReceiveTab';
import { AddressesTab } from './components/AddressesTab';
import { KeystoreTab } from './components/KeystoreTab';
import { LightningTab } from './components/LightningTab';
import { NetworkTab } from './components/NetworkTab';
import { TxDetailsModal } from './components/TxDetailsModal';
import { NewWalletModal } from './components/NewWalletModal';
import { TransactionItem } from './types';
import { Shield, Lock, Radio } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabId>('history');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [showNewWalletModal, setShowNewWalletModal] = useState(false);

  const { isLocked, toggleLock, activeServer, network } = useWallet();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header onOpenNewWallet={() => setShowNewWalletModal(true)} />

      {/* Navigation Tabs */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLocked ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xl">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Carteira Bloqueada</h2>
            <p className="text-xs text-slate-400">
              O cofre de chaves privadas está temporariamente bloqueado para segurança. Clique abaixo para desbloquear o acesso.
            </p>
            <button
              onClick={toggleLock}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/20"
            >
              Desbloquear Carteira
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'history' && <HistoryTab onSelectTx={setSelectedTx} />}
            {currentTab === 'send' && <SendTab />}
            {currentTab === 'receive' && <ReceiveTab />}
            {currentTab === 'addresses' && <AddressesTab />}
            {currentTab === 'keystore' && <KeystoreTab />}
            {currentTab === 'lightning' && <LightningTab />}
            {currentTab === 'network' && <NetworkTab />}
          </>
        )}
      </main>

      {/* Bottom Footer Status Bar (Classic Electrum style) */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-2.5 px-4 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SPV Sincronizado</span>
            <span className="text-slate-500">&bull; Bloco #{activeServer.height}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Servidor: {activeServer.host}:{activeServer.port}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-500">
          <span>Gerenciador de Chaves Segura (Electrum Client)</span>
          <span className="text-slate-700">&bull;</span>
          <span>BIP39 / BIP84 / Lightning Network</span>
        </div>
      </footer>

      {/* Modals */}
      <TxDetailsModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      <NewWalletModal isOpen={showNewWalletModal} onClose={() => setShowNewWalletModal(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <MainLayout />
    </WalletProvider>
  );
};

export default App;
