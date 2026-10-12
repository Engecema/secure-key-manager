import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Save,
  Trash2,
  Key,
  Globe,
  Terminal,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getStoredConfig,
  updateSupabaseCredentials,
  clearSupabaseCredentials,
  getSupabaseClient,
} from '../lib/supabase';

interface SupabaseRenderPanelProps {
  onCredentialsUpdated: () => void;
}

export const SupabaseRenderPanel: React.FC<SupabaseRenderPanelProps> = ({
  onCredentialsUpdated,
}) => {
  const currentConfig = getStoredConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSaveSupabase = async () => {
    setTestingConnection(true);
    setTestResult(null);

    const ok = updateSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    if (!ok) {
      setTestResult({
        success: false,
        message: 'Formato inválido de URL ou chave anon.',
      });
      setTestingConnection(false);
      return;
    }

    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Cliente Supabase não inicializou.');

      const { error } = await client.auth.getSession();
      if (error && error.message.includes('Invalid API key')) {
        setTestResult({
          success: false,
          message: 'Chave de API anon inválida para este projeto Supabase.',
        });
      } else {
        setTestResult({
          success: true,
          message: 'Conexão com o Supabase estabelecida com sucesso!',
        });
        onCredentialsUpdated();
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao testar conexão com o Supabase.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    onCredentialsUpdated();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const sqlSchemaCode = `-- Tabela de perfis e carteiras associadas aos usuários autenticados
create table if not exists public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  wallet_address text not null,
  encrypted_vault text not null,
  network text default 'regtest',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar segurança em nível de linha (RLS)
alter table public.user_wallets enable row level security;

-- Política: Usuário só pode ler sua própria carteira
create policy "Usuários leem suas próprias carteiras"
  on public.user_wallets for select
  using (auth.uid() = user_id);

-- Política: Usuário só pode criar/atualizar sua própria carteira
create policy "Usuários gravam suas próprias carteiras"
  on public.user_wallets for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam suas próprias carteiras"
  on public.user_wallets for update
  using (auth.uid() = user_id);
`;

  const renderYamlCode = `# render.yaml - Especificação do serviço no Render
services:
  - type: web
    name: bitx-core-website
    env: node
    plan: free
    region: oregon
    buildCommand: npm ci --prefix client-wallet && npm run build --prefix client-wallet
    staticPublishPath: ./website
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: NODE_VERSION
        value: 22
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
`;

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="border-b border-[#d5d9ce] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#204336] px-3 py-1 text-xs font-bold text-[#b9ef6b]">
              <Database className="h-3.5 w-3.5" /> Integrações Oficiais
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#172522]">
              Configuração Supabase & Render
            </h1>
            <p className="mt-1 text-sm text-[#586761]">
              Gerencie a autenticação em nuvem no Supabase e a hospedagem contínua no Render.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                isConfigured
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-amber-300 bg-amber-50 text-amber-800'
              }`}
            >
              {isConfigured ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Supabase Conectado</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Supabase Desconectado</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* BLOCO 1: SUPABASE */}
        <div className="rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#d5d9ce] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold">
                ⚡
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172522]">1. Supabase (Auth & Banco)</h2>
                <p className="text-xs text-[#586761]">Provedor de autenticação e perfis</p>
              </div>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              Painel Supabase <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172522]">
                Project URL do Supabase
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d5d9ce] bg-[#f4f3ed]/50 px-3 py-2 text-xs font-mono text-[#172522] focus:border-emerald-700 focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-[#586761]">
                Encontrada em <strong>Project Settings ➔ API ➔ Project URL</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172522]">
                anon / public API Key
              </label>
              <textarea
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#d5d9ce] bg-[#f4f3ed]/50 p-3 text-xs font-mono text-[#172522] focus:border-emerald-700 focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-[#586761]">
                Encontrada em <strong>Project Settings ➔ API ➔ Project API keys ➔ anon</strong>
              </span>
            </div>

            {testResult && (
              <div
                className={`rounded-lg border p-3 text-xs ${
                  testResult.success
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-rose-300 bg-rose-50 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveSupabase}
                disabled={testingConnection || !supabaseUrl || !supabaseAnonKey}
                className="flex items-center gap-1.5 rounded-lg bg-[#172522] px-4 py-2 text-xs font-bold text-[#b9ef6b] shadow-sm transition hover:bg-[#204336] disabled:opacity-50"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Testando Conexão...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Salvar e Conectar Supabase</span>
                  </>
                )}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 rounded-lg border border-[#d5d9ce] px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Desconectar</span>
                </button>
              )}
            </div>
          </div>

          {/* Guia de Configuração de URL no Supabase */}
          <div className="mt-6 rounded-xl border border-[#d5d9ce] bg-[#f4f3ed] p-4 text-xs text-[#172522]">
            <h4 className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Configuração no Painel Supabase Auth:
            </h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[11px] text-[#586761]">
              <li>Acesse <strong>Authentication ➔ URL Configuration</strong>.</li>
              <li>
                Defina <strong>Site URL</strong> como <code>https://bitx-core.onrender.com</code>.
              </li>
              <li>
                Em <strong>Redirect URLs</strong>, adicione:
                <code className="ml-1 rounded bg-white px-1.5 py-0.5 text-[#172522]">https://bitx-core.onrender.com/**</code>.
              </li>
            </ol>
          </div>

          {/* SQL Schema opcional */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#172522]">
              <span>SQL para Tabela de Carteiras de Usuários:</span>
              <button
                onClick={() => copyToClipboard(sqlSchemaCode, 'sql')}
                className="flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
              >
                <Copy className="h-3 w-3" />
                {copiedCode === 'sql' ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <pre className="mt-1.5 max-h-36 overflow-x-auto rounded-lg bg-[#172522] p-3 text-[10px] text-[#b9ef6b] font-mono">
              {sqlSchemaCode}
            </pre>
          </div>
        </div>

        {/* BLOCO 2: RENDER */}
        <div className="rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#d5d9ce] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#204336] text-white font-bold">
                <Cloud className="h-5 w-5 text-[#b9ef6b]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172522]">2. Render (Provedor Cloud)</h2>
                <p className="text-xs text-[#586761]">Hospedagem contínua e domínio oficial</p>
              </div>
            </div>
            <a
              href="https://dashboard.render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#204336] hover:underline"
            >
              Painel Render <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
              <h4 className="font-bold flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-blue-700" />
                Passos para conectar no Render Dashboard:
              </h4>
              <ol className="mt-2 list-decimal space-y-2 pl-4 text-[11px] text-blue-800">
                <li>
                  No Render, clique em <strong>New + ➔ Web Service</strong> (ou Static Site).
                </li>
                <li>
                  Conecte seu repositório GitHub: <strong>Engecema/bitx-core</strong> (Branch <code>main</code>).
                </li>
                <li>
                  Configure os comandos de deploy:
                  <div className="mt-1.5 space-y-1 rounded bg-white/80 p-2 font-mono text-[10px] text-slate-800">
                    <div><strong>Build Command:</strong> <code>npm ci --prefix client-wallet && npm run build --prefix client-wallet</code></div>
                    <div><strong>Publish Directory:</strong> <code>./website</code> (para Static Site)</div>
                    <div><strong>Start Command:</strong> <code>python3 server.py</code> (se Web Service)</div>
                  </div>
                </li>
                <li>
                  Em <strong>Environment Variables</strong> no Render, cadastre:
                  <div className="mt-1 space-y-1 font-mono text-[10px] text-slate-700">
                    <div>• <code>VITE_SUPABASE_URL</code> = {supabaseUrl || '(sua URL)'}</div>
                    <div>• <code>VITE_SUPABASE_ANON_KEY</code> = (sua chave anon)</div>
                  </div>
                </li>
              </ol>
            </div>

            {/* URL Oficial de Produção no Render */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs">
              <h4 className="font-bold text-[#172522] flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-700" />
                Endereço Oficial de Produção no Render
              </h4>
              <p className="mt-1 text-[11px] text-[#586761]">
                O serviço está publicado com HTTPS ativo diretamente pelo Render:
              </p>
              <div className="mt-2 rounded bg-white p-2.5 font-mono text-xs text-emerald-900 font-bold border border-emerald-200 flex items-center justify-between">
                <span>https://bitx-core.onrender.com</span>
                <span className="text-[10px] text-emerald-600 font-sans font-semibold">● Ativo</span>
              </div>
            </div>

            {/* render.yaml */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#172522]">
                <span>Especificação automática (render.yaml):</span>
                <button
                  onClick={() => copyToClipboard(renderYamlCode, 'yaml')}
                  className="flex items-center gap-1 text-[11px] text-[#204336] hover:underline"
                >
                  <Copy className="h-3 w-3" />
                  {copiedCode === 'yaml' ? 'Copiado!' : 'Copiar render.yaml'}
                </button>
              </div>
              <pre className="mt-1.5 max-h-36 overflow-x-auto rounded-lg bg-[#172522] p-3 text-[10px] text-[#b9ef6b] font-mono">
                {renderYamlCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
