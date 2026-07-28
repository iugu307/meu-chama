export default function ExclusaoDados() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Exclusão de Dados
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Como Solicitar Exclusão de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Você pode solicitar a exclusão de todos os seus dados a qualquer momento. Aqui está o processo:
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              1. Desconectando sua Conta
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Acesse o painel de controle e clique em "Desconectar Instagram". Isso irá:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Revogar o acesso ao seu Instagram</li>
              <li>Excluir seu token de acesso do nosso banco de dados</li>
              <li>Parar de processar comentários e mensagens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              2. Exclusão Completa de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Para excluir completamente todos os seus dados, incluindo:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Configurações de automações</li>
              <li>Histórico de contatos</li>
              <li>Fila de mensagens</li>
              <li>Registros de eventos</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              Envie um email para <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                iugu307@gmail.com
              </span> com o assunto "Solicitar Exclusão de Dados" e confirme seu username do Instagram.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              3. Prazo de Processamento
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Solicitações de exclusão serão processadas em até 30 dias. Você receberá uma confirmação por email
              quando a exclusão for concluída.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              4. O Que Acontece com os Dados de Contatos
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Quando você exclui sua conta:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Informações de contatos recebidas de comentários são excluídas</li>
              <li>Histórico de interações é removido</li>
              <li>Nenhum dado é mantido após a exclusão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              5. Dados Técnicos
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Registros técnicos e logs do servidor podem ser mantidos por razões de segurança, mas serão
              anonimizados e não conterão informações pessoais vinculadas à sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              6. Dúvidas?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Entre em contato conosco em <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                iugu307@gmail.com
              </span> se tiver dúvidas sobre privacidade ou exclusão de dados.
            </p>
          </section>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-8">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}
