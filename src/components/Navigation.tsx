import React from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ListTree,
  KeyRound,
  Zap,
  Server
} from 'lucide-react';

export type TabId = 'history' | 'send' | 'receive' | 'addresses' | 'keystore' | 'lightning' | 'network';

interface NavigationProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const { lang, transactions, channels } = useWallet();
  const t = getTranslation(lang);

  const pendingCount = transactions.filter((tx) => tx.status === 'unconfirmed').length;
  const activeChannelsCount = channels.filter((c) => c.status === 'open').length;

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'history',
      label: t.history,
      icon: <Clock className="w-4 h-4" />,
      badge: pendingCount > 0 ? `${pendingCount} pendente` : undefined,
    },
    {
      id: 'send',
      label: t.send,
      icon: <ArrowUpRight className="w-4 h-4" />,
    },
    {
      id: 'receive',
      label: t.receive,
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      id: 'addresses',
      label: t.addresses,
      icon: <ListTree className="w-4 h-4" />,
    },
    {
      id: 'keystore',
      label: t.keystore,
      icon: <KeyRound className="w-4 h-4" />,
    },
    {
      id: 'lightning',
      label: t.lightning,
      icon: <Zap className="w-4 h-4" />,
      badge: activeChannelsCount > 0 ? `${activeChannelsCount}` : undefined,
    },
    {
      id: 'network',
      label: t.network,
      icon: <Server className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
