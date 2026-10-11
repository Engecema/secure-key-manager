import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getTranslation } from '../utils/translations';
import { formatSatoshis, formatFiat } from '../utils/bitcoin';
import {
  Shield,
  Lock,
  Unlock,
  Radio,
  Zap,
  RefreshCw,
  Plus,
  Coins,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BitcoinUnit, FiatCurrency, Language } from '../types';

interface HeaderProps {
  onOpenNewWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewWallet }) => {
  const {
    walletName,
    walletType,
    network,
    unit,
    fiat,
    lang,
    isLocked,
    toggleLock,
    setUnit,
    setFiat,
    setLang,
    onchainBalanceSat,
    lightningBalanceSat,
    totalBalanceSat,
    activeServer,
    torEnabled,
  } = useWallet();

  const t = getTranslation(lang);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-800/60 text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-amber-500 font-semibold tracking-wide">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-slate-200">Gerenciador de Chaves Segura</span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              Electrum v4.5
            </span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Network indicator */}
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="capitalize text-slate-300 font-medium">{network}</span>
            <span className="text-slate-500 font-mono">#{activeServer.height.toLocaleString()}</span>
          </div>

          {torEnabled && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
              TOR: 9050
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Server status pill */}
          <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">{activeServer.host}</span>
            <span className="text-slate-500 font-normal">({activeServer.pingMs}ms)</span>
          </div>

          {/* Language selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 rounded-md p-0.5 border border-slate-800">
            <Globe className="w-3 h-3 text-slate-400 ml-1.5" />
            {(['pt', 'en', 'es'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded ${
                  lang === l
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Unit selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 rounded-md p-0.5 border border-slate-800">
            <Coins className="w-3 h-3 text-slate-400 ml-1.5" />
            {(['sat', 'BTC', 'mBTC'] as BitcoinUnit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                  unit === u
                    ? 'bg-slate-700 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Fiat selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 rounded-md p-0.5 border border-slate-800">
            {(['BRL', 'USD', 'EUR'] as FiatCurrency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiat(f)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                  fiat === f
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Lock / Unlock */}
          <button
            onClick={toggleLock}
            title={isLocked ? t.lockWallet : t.unlocked}
            className={`p-1.5 rounded-md border flex items-center space-x-1 text-xs transition-colors ${
              isLocked
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main header dashboard bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Wallet info */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Coins className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                {walletName}
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {walletType === 'segwit_native' ? 'Native SegWit (p2wpkh)' : walletType}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.appSubtitle} &bull; Keystore OK
            </p>
          </div>
        </div>

        {/* Balances overview */}
        <div className="flex items-center gap-6">
          {/* On-chain balance */}
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {t.onchainBalance}
            </div>
            <div className="font-mono text-base font-bold text-slate-100">
              {formatSatoshis(onchainBalanceSat, unit)} <span className="text-xs font-normal text-amber-400">{unit}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {formatFiat(onchainBalanceSat, fiat)}
            </div>
          </div>

          <div className="h-9 w-px bg-slate-800"></div>

          {/* Lightning balance */}
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              {t.lightningBalance}
            </div>
            <div className="font-mono text-base font-bold text-cyan-300">
              {formatSatoshis(lightningBalanceSat, unit)} <span className="text-xs font-normal text-cyan-400">{unit}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {formatFiat(lightningBalanceSat, fiat)}
            </div>
          </div>

          <div className="h-9 w-px bg-slate-800"></div>

          {/* Total balance */}
          <div className="text-right pl-2">
            <div className="text-[11px] text-emerald-400 font-semibold">
              {t.balance}
            </div>
            <div className="font-mono text-lg font-extrabold text-emerald-400">
              {formatSatoshis(totalBalanceSat, unit)} <span className="text-xs font-normal">{unit}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono font-medium">
              {formatFiat(totalBalanceSat, fiat)}
            </div>
          </div>

          {/* Action button: New Wallet */}
          <button
            onClick={onOpenNewWallet}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newWallet}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
