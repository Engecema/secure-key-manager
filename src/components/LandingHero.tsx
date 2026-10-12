import React from 'react';
import { ArrowRight, Shield, Zap, Lock, BookOpen, Layers, CheckCircle } from 'lucide-react';

interface LandingHeroProps {
  onOpenWallet: () => void;
  onOpenNode: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenWallet,
  onOpenNode,
}) => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5d9ce] bg-[#e8ebe2]/70 px-3.5 py-1 text-xs font-semibold text-[#204336]">
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
              Cofre Criptográfico · Gestão de Chaves e Acessos
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#172522] leading-[1.08]">
              Chaves Seguras.<br />
              <span className="text-[#204336]">Controle total.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#586761] leading-relaxed">
              Gerencie chaves criptográficas, frases mnemônicas de recuperação e credenciais de segurança com
              isolamento no navegador e persistência protegida no Supabase Auth.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-2 rounded-xl bg-[#172522] px-6 py-3.5 text-sm font-bold text-[#b9ef6b] shadow-md transition hover:bg-[#204336] hover:shadow-lg"
              >
                <span>Acessar Cofre de Chaves</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenNode}
                className="flex items-center gap-2 rounded-xl border border-[#d5d9ce] bg-white px-5 py-3.5 text-sm font-bold text-[#172522] transition hover:bg-[#e8ebe2]"
              >
                <span>Painel do Servidor RPC</span>
              </button>
            </div>
          </div>

          {/* Visual SKM Graphic */}
          <div className="relative flex min-h-[320px] sm:min-h-[380px] items-center justify-center overflow-hidden rounded-3xl border border-[#315246] bg-[#204336] p-8 shadow-2xl">
            {/* Background geometric grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#b9ef6b_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Concentric circles */}
            <div className="absolute h-64 w-64 rounded-full border border-[#d4f5ad]/20 animate-pulse" />
            <div className="absolute h-80 w-80 rounded-full border border-[#d4f5ad]/10" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-[#e8ffc1] bg-[#b9ef6b] shadow-[0_0_0_16px_rgba(185,239,107,0.15)]">
                <span className="font-serif text-4xl font-extrabold text-[#204336]">SKM</span>
              </div>
              <span className="mt-6 rounded-full bg-black/30 px-3.5 py-1 text-xs font-mono tracking-widest text-[#e8ffc1] uppercase">
                Secure Key Manager
              </span>
              <p className="mt-2 text-center text-xs text-[#d5d9ce]">
                Custódia Não-Compartilhada · Padrão BIP39 / PBKDF2
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facts Banner */}
      <section className="border-y border-[#d5d9ce] bg-[#e8ebe2]/40 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 divide-y divide-[#d5d9ce] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-6 py-4 text-center sm:text-left">
              <strong className="font-serif text-xl font-bold text-[#172522]">BitX Core</strong>
              <p className="text-xs text-[#586761] mt-1">Software de nó independente derivado do protocolo Bitcoin.</p>
            </div>
            <div className="px-6 py-4 text-center sm:text-left">
              <strong className="font-serif text-xl font-bold text-[#172522]">BTXC</strong>
              <p className="text-xs text-[#586761] mt-1">Ativo nativo e meio de liquidação na rede descentralizada.</p>
            </div>
            <div className="px-6 py-4 text-center sm:text-left">
              <strong className="font-serif text-xl font-bold text-[#172522]">Regtest & Testnet</strong>
              <p className="text-xs text-[#586761] mt-1">Ambiente isolado de testes e validação sem risco financeiro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como começar com segurança */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#f0784b]">
            Diretrizes Técnicas
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold text-[#172522]">
            Comece com segurança e autonomia.
          </h2>
          <p className="mt-2 text-sm text-[#586761] max-w-2xl">
            A carteira cliente executa chaves criptográficas diretamente no seu navegador
            (client-side) e pode sincronizar o cofre protegido no Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#f0784b]">01 / CRIPTOGRAFIA</span>
            <h3 className="mt-3 text-base font-bold text-[#172522]">Geração de Frase Segura</h3>
            <p className="mt-2 text-xs text-[#586761] leading-relaxed">
              Padrão BIP39 com derivação nativa SegWit (m/84'/1'/0'). As chaves privadas nunca deixam
              seu navegador em texto plano.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#f0784b]">02 / AUTENTICAÇÃO</span>
            <h3 className="mt-3 text-base font-bold text-[#172522]">Sincronização Supabase</h3>
            <p className="mt-2 text-xs text-[#586761] leading-relaxed">
              Com o Supabase Auth ativo, seu cofre criptografado com senha forte pode ser salvo com
              segurança em nível de linha (RLS).
            </p>
          </div>

          <div className="rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold text-[#f0784b]">03 / HOSPEDAGEM</span>
            <h3 className="mt-3 text-base font-bold text-[#172522]">Deploy Contínuo no Render</h3>
            <p className="mt-2 text-xs text-[#586761] leading-relaxed">
              O repositório oficial é construído e servido diretamente pelo Render com SSL automático no
              domínio corporativo engecema.com.br.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
