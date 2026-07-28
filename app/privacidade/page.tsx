export default function Privacidade() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Política de Privacidade
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              1. Informações que Coletamos
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Coletamos informações de sua conta do Instagram necessárias para operar o serviço de automação:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>ID e nome de usuário do Instagram</li>
              <li>Foto de perfil</li>
              <li>Mensagens de comentários e DMs recebidas</li>
              <li>Registros de eventos processados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              2. Como Usamos Seus Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Seus dados são usados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Processar comentários e mensagens de acordo com suas automações</li>
              <li>Enviar respostas automáticas configuradas por você</li>
              <li>Manter registro de interações para auditoria</li>
              <li>Renovar automaticamente seu token de acesso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              3. Compartilhamento de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Seus dados não são compartilhados com terceiros. Todos os dados são armazenados de forma privada
              e acessados apenas por você através da sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              4. Segurança
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Implementamos medidas de segurança padrão da indústria para proteger seus dados. Seu token de acesso
              é armazenado de forma segura e nunca é exposto ao navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              5. Retenção de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Os dados são mantidos enquanto sua conta estiver ativa. Você pode solicitar a exclusão a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              6. Seus Direitos
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento. Entre em contato conosco
              através da página de{" "}
              <a href="/exclusao-de-dados" className="text-blue-600 dark:text-blue-400 hover:underline">
                exclusão de dados
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              7. Alterações nesta Política
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Podemos atualizar esta política de tempos em tempos. Notificaremos sobre mudanças significativas.
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
