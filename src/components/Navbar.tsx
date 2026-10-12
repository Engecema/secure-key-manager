import React from 'react';
import { Shield, Wallet, Server, Settings, User as UserIcon, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  activeTab: 'inicio' | 'carteira' | 'painel' | 'integracoes';
  setActiveTab: (tab: 'inicio' | 'carteira' | 'painel' | 'integracoes') => void;
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const supabaseReady = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#d5d9ce] bg-[#f4f3ed]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2.5 text-left transition hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#172522] text-xs font-extrabold text-[#b9ef6b] shadow-sm">
              SKM
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold tracking-wider text-[#172522]">
                <span>SECURE KEY MANAGER</span>
                <span className="rounded bg-[#204336] px-1.5 py-0.5 text-[10px] font-bold text-[#b9ef6b]">
                  CHAVES
                </span>
              </div>
              <p className="text-[10px] text-[#586761]">Gerenciador de Chaves Seguras</p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#d5d9ce] bg-[#e8ebe2]/60 p-1">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'inicio'
                ? 'bg-[#172522] text-white shadow-sm'
                : 'text-[#586761] hover:text-[#172522]'
            }`}
          >
            Apresentação
          </button>
          <button
            onClick={() => setActiveTab('carteira')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'carteira'
                ? 'bg-[#172522] text-white shadow-sm'
                : 'text-[#586761] hover:text-[#172522]'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            Cofre de Chaves
          </button>
          <button
            onClick={() => setActiveTab('painel')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'painel'
                ? 'bg-[#172522] text-white shadow-sm'
                : 'text-[#586761] hover:text-[#172522]'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            Painel do Servidor
          </button>
          <button
            onClick={() => setActiveTab('integracoes')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'integracoes'
                ? 'bg-[#204336] text-[#b9ef6b] shadow-sm'
                : 'text-[#586761] hover:text-[#172522]'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Supabase & Render
            {supabaseReady ? (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Supabase configurado" />
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-amber-500" title="Configuração pendente" />
            )}
          </button>
        </nav>

        {/* User / Auth Action */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#172522] truncate max-w-[150px]">
                  {user.email}
                </span>
                <span className="text-[10px] text-emerald-600 flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Autenticado
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1 rounded-lg border border-[#d5d9ce] bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                title="Sair da conta"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-full bg-[#172522] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#204336] hover:text-[#b9ef6b]"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="flex md:hidden border-t border-[#d5d9ce] bg-[#e8ebe2]/90 px-3 py-2 justify-around text-xs">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`px-2 py-1 font-semibold ${activeTab === 'inicio' ? 'text-[#172522] underline' : 'text-[#586761]'}`}
        >
          A Rede
        </button>
        <button
          onClick={() => setActiveTab('carteira')}
          className={`flex items-center gap-1 px-2 py-1 font-semibold ${activeTab === 'carteira' ? 'text-[#172522] underline' : 'text-[#586761]'}`}
        >
          <Wallet className="h-3.5 w-3.5" /> Carteira
        </button>
        <button
          onClick={() => setActiveTab('painel')}
          className={`flex items-center gap-1 px-2 py-1 font-semibold ${activeTab === 'painel' ? 'text-[#172522] underline' : 'text-[#586761]'}`}
        >
          <Server className="h-3.5 w-3.5" /> Nó
        </button>
        <button
          onClick={() => setActiveTab('integracoes')}
          className={`flex items-center gap-1 px-2 py-1 font-semibold ${activeTab === 'integracoes' ? 'text-[#204336] font-bold' : 'text-[#586761]'}`}
        >
          <Settings className="h-3.5 w-3.5" /> Supabase/Render
        </button>
      </div>
    </header>
  );
};
