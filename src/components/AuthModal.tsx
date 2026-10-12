import React, { useState } from 'react';
import { X, Lock, Mail, UserPlus, LogIn, AlertCircle, CheckCircle, ExternalLink, Settings } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenConfig: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenConfig,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isConfigured) {
      setErrorMessage('O Supabase ainda não está configurado. Conecte sua Project URL e chave anon.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMessage('Falha ao inicializar o cliente Supabase.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.user) {
          if (data.session) {
            setSuccessMessage('Conta criada com sucesso e autenticada!');
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1000);
          } else {
            setSuccessMessage('Conta criada! Verifique seu e-mail para confirmação se configurado no Supabase.');
          }
        }
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.session) {
          setSuccessMessage('Login efetuado com sucesso!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://bitx-core.onrender.com',
        });
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Link de redefinição de senha enviado para seu e-mail!');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[#d5d9ce] bg-[#f4f3ed] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[#586761] hover:bg-[#e8ebe2] hover:text-[#172522]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#172522] text-[#b9ef6b]">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-[#172522]">
            {mode === 'login'
              ? 'Acessar Conta BitX Core'
              : mode === 'register'
              ? 'Criar Nova Conta'
              : 'Recuperar Acesso'}
          </h2>
          <p className="text-xs text-[#586761]">
            {mode === 'forgot'
              ? 'Informe seu e-mail para receber o link de redefinição'
              : 'Autenticação segura gerenciada pelo Supabase Auth'}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Supabase não conectado ainda</p>
                <p className="mt-0.5 text-amber-800">
                  Para autenticar usuários, informe a URL do projeto e a chave anon do Supabase.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConfig();
                  }}
                  className="mt-2 inline-flex items-center gap-1 rounded bg-amber-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-800"
                >
                  <Settings className="h-3 w-3" /> Configurar Supabase agora
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#172522]">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome ou razão social"
                className="mt-1 w-full rounded-lg border border-[#d5d9ce] bg-white px-3 py-2 text-sm text-[#172522] focus:border-[#204336] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172522]">E-mail</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#586761]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full rounded-lg border border-[#d5d9ce] bg-white pl-9 pr-3 py-2 text-sm text-[#172522] focus:border-[#204336] focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#172522]">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#204336] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#586761]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-[#d5d9ce] bg-white pl-9 pr-3 py-2 text-sm text-[#172522] focus:border-[#204336] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#172522] py-2.5 text-sm font-bold text-[#b9ef6b] shadow-sm transition hover:bg-[#204336] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b9ef6b] border-t-transparent" />
                Processando...
              </span>
            ) : mode === 'login' ? (
              <span className="inline-flex items-center gap-1.5">
                <LogIn className="h-4 w-4" /> Entrar
              </span>
            ) : mode === 'register' ? (
              <span className="inline-flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" /> Cadastrar Conta
              </span>
            ) : (
              <span>Enviar Link de Recuperação</span>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-[#d5d9ce] pt-4 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-[#586761]">
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="font-bold text-[#172522] underline hover:text-[#204336]"
              >
                Cadastre-se aqui
              </button>
            </p>
          ) : mode === 'register' ? (
            <p className="text-xs text-[#586761]">
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="font-bold text-[#172522] underline hover:text-[#204336]"
              >
                Faça login
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#586761]">
              Lembrou a senha?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="font-bold text-[#172522] underline hover:text-[#204336]"
              >
                Voltar ao login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
