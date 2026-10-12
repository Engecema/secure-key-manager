import React from 'react';
import { X, Shield, FileText, Cookie } from 'lucide-react';

interface LegalModalProps {
  type: 'privacidade' | 'termos' | 'cookies' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d5d9ce] bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[#586761] hover:bg-[#e8ebe2] hover:text-[#172522]"
        >
          <X className="h-5 w-5" />
        </button>

        {type === 'privacidade' && (
          <div className="space-y-4 text-xs text-[#586761] leading-relaxed">
            <div className="flex items-center gap-2 border-b border-[#d5d9ce] pb-3 text-base font-bold text-[#172522]">
              <Shield className="h-5 w-5 text-emerald-700" />
              Política de Privacidade - Rede BitX Core
            </div>
            <p>
              A <strong>Engecema Engenharia Fomento e Tecnologia Ltda</strong> (CNPJ 05.368.602/0002-09), com sede
              em Campinas do Piauí/PI, preza pela privacidade e proteção de dados dos usuários e desenvolvedores.
            </p>
            <h4 className="font-bold text-[#172522]">1. Chaves Privadas e Carteiras</h4>
            <p>
              A carteira BitX Core opera sob a arquitetura de custódia não-compartilhada (non-custodial). Suas
              chaves privadas e frases mnemônicas são criptografadas diretamente no cliente (navegador) e nunca são
              armazenadas em texto puro em nossos servidores.
            </p>
            <h4 className="font-bold text-[#172522]">2. Autenticação e Supabase</h4>
            <p>
              Quando o usuário opta por sincronizar seu cofre com o Supabase, as credenciais e tokens de acesso são
              protegidos através de criptografia e políticas de segurança RLS (Row Level Security), de acordo com a
              LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018).
            </p>
            <h4 className="font-bold text-[#172522]">3. Dados de Conexão com o Nó</h4>
            <p>
              Informações de telemetria e chamadas RPC contêm apenas dados técnicos estritamente necessários para
              comunicação com a rede descentralizada BTXC.
            </p>
          </div>
        )}

        {type === 'termos' && (
          <div className="space-y-4 text-xs text-[#586761] leading-relaxed">
            <div className="flex items-center gap-2 border-b border-[#d5d9ce] pb-3 text-base font-bold text-[#172522]">
              <FileText className="h-5 w-5 text-emerald-700" />
              Termos de Uso - BitX Core / BTXC
            </div>
            <p>
              Ao utilizar este software e os serviços da rede BitX Core, você concorda expressamente com os termos
              estabelecidos pela <strong>Engecema Engenharia Fomento e Tecnologia Ltda</strong>.
            </p>
            <h4 className="font-bold text-[#172522]">1. Natureza Experimental (Regtest)</h4>
            <p>
              A versão disponibilizada neste portal opera em modo <strong>Regtest / Testnet</strong>. As moedas BTXC
              geradas e transferidas neste ambiente são exclusivamente para fins de teste, desenvolvimento e
              validação técnica, não possuindo valor monetário fiduciário ou de investimento.
            </p>
            <h4 className="font-bold text-[#172522]">2. Responsabilidade pelas Chaves</h4>
            <p>
              O usuário é o único responsável pela guarda de suas palavras de recuperação e senhas. A Engecema não
              possui capacidade de recuperação de chaves privadas perdidas pelo usuário.
            </p>
            <h4 className="font-bold text-[#172522]">3. Licença de Código Aberto</h4>
            <p>
              O código-fonte do BitX Core é disponibilizado nos termos da licença MIT / Apache 2.0 no GitHub oficial
              (Engecema/bitx-core).
            </p>
          </div>
        )}

        {type === 'cookies' && (
          <div className="space-y-4 text-xs text-[#586761] leading-relaxed">
            <div className="flex items-center gap-2 border-b border-[#d5d9ce] pb-3 text-base font-bold text-[#172522]">
              <Cookie className="h-5 w-5 text-emerald-700" />
              Política de Cookies e Armazenamento Local
            </div>
            <p>
              Utilizamos armazenamento local essencial (LocalStorage e SessionStorage) no navegador para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manter a sessão autenticada do usuário via Supabase Auth;</li>
              <li>Armazenar o cofre criptografado da carteira no dispositivo do usuário;</li>
              <li>Preservar preferências de visualização e rede.</li>
            </ul>
            <p>
              Nenhum dado é compartilhado com terceiros para fins de rastreamento publicitário.
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-[#d5d9ce] pt-4 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#172522] px-4 py-2 text-xs font-bold text-white hover:bg-[#204336]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
