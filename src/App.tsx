import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { WalletView } from './components/WalletView';
import { NodeDashboard } from './components/NodeDashboard';
import { SupabaseRenderPanel } from './components/SupabaseRenderPanel';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'carteira' | 'painel' | 'integracoes'>('inicio');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacidade' | 'termos' | 'cookies' | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Supabase Auth listener
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setUser(null);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    }).catch(err => {
      console.warn('Erro ao obter sessão Supabase:', err);
    });

    // Listen to changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshTrigger]);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ed] text-[#172522] selection:bg-[#b9ef6b] selection:text-[#172522]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Body */}
      <main className="min-h-[calc(100vh-220px)]">
        {activeTab === 'inicio' && (
          <LandingHero
            onOpenWallet={() => setActiveTab('carteira')}
            onOpenNode={() => setActiveTab('painel')}
          />
        )}

        {activeTab === 'carteira' && (
          <WalletView
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenConfig={() => setActiveTab('integracoes')}
          />
        )}

        {activeTab === 'painel' && <NodeDashboard />}

        {activeTab === 'integracoes' && (
          <SupabaseRenderPanel
            onCredentialsUpdated={() => setRefreshTrigger((t) => t + 1)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d5d9ce] bg-[#e8ebe2]/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#172522] text-xs font-bold text-[#b9ef6b]">
                  SKM
                </div>
                <strong className="text-sm font-extrabold text-[#172522]">Secure Key Manager</strong>
              </div>
              <p className="mt-2 text-xs text-[#586761] leading-relaxed">
                Plataforma corporativa para custódia segura, cofre criptográfico e gestão de chaves privadas e credenciais com Supabase.
              </p>
              <div className="mt-3">
                <a
                  href="https://github.com/Engecema/bitx-core"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#204336] hover:underline"
                >
                  Repositório Oficial no GitHub ➔
                </a>
              </div>
            </div>

            <address className="not-italic text-xs text-[#586761] space-y-1">
              <strong className="block text-sm text-[#172522]">Engecema Engenharia Fomento e Tecnologia Ltda</strong>
              <div>CNPJ: 05.368.602/0002-09</div>
              <div>Rua José de Moraes Rego, 1299, Sala A, Centro</div>
              <div>Campinas do Piauí - PI, CEP 64730-000</div>
              <div className="text-[11px] text-[#586761] pt-1">Hospedagem Oficial: <strong>bitx-core.onrender.com</strong></div>
            </address>

            <div className="space-y-2 text-xs">
              <strong className="block text-sm text-[#172522]">Termos e Governança</strong>
              <div className="flex flex-col space-y-1.5 text-[#586761]">
                <button
                  onClick={() => setLegalModalType('privacidade')}
                  className="text-left hover:text-[#172522] hover:underline"
                >
                  Política de Privacidade (LGPD)
                </button>
                <button
                  onClick={() => setLegalModalType('termos')}
                  className="text-left hover:text-[#172522] hover:underline"
                >
                  Termos de Uso do Ecossistema
                </button>
                <button
                  onClick={() => setLegalModalType('cookies')}
                  className="text-left hover:text-[#172522] hover:underline"
                >
                  Política de Cookies e Cofre Local
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#d5d9ce] pt-4 text-center text-[11px] text-[#586761]">
            © {new Date().getFullYear()} BitX Core / Engecema Tecnologia. Desenvolvido para testes e governança da rede BTXC.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
        onOpenConfig={() => setActiveTab('integracoes')}
      />

      {/* Legal Information Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
