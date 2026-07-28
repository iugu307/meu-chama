"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

interface Config {
  id: string;
  instagram_username: string;
  profile_picture_url: string | null;
  token_expires_at: string;
}

interface Automation {
  id: string;
  name: string;
  active: boolean;
  keywords: string[];
  match_type: string;
  triggers: string[];
}

export default function Dashboard() {
  const [config, setConfig] = useState<Config | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/dashboard/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }

      const automationsRes = await fetch("/api/automations");
      if (automationsRes.ok) {
        const data = await automationsRes.json();
        setAutomations(data);
      }
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const handleConnect = () => {
    if (!APP_ID || !APP_URL) {
      console.log("Missing APP_ID or APP_URL", { APP_ID, APP_URL });
      return;
    }

    const redirectUri = `${APP_URL}/api/oauth/callback`;
    const scope = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments";
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
    console.log("Generated auth URL:", authUrl);
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">meu-chama</h1>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {config ? `@${config.instagram_username}` : "Desconectado"}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Status do Instagram
              </h2>
              {config ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conectado como <span className="font-medium text-slate-900 dark:text-white">@{config.instagram_username}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Token expira em {new Date(config.token_expires_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nenhuma conta conectada
                </p>
              )}
            </div>
            <button
              onClick={handleConnect}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                config
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {config ? "Reconectar" : "Conectar Instagram"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Automations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Automações</h2>
            {config && (
              <Link
                href="/automation/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Nova Automação
              </Link>
            )}
          </div>

          {!config ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Conecte seu Instagram para começar a criar automações
              </p>
              <button
                onClick={handleConnect}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Conectar Agora
              </button>
            </div>
          ) : automations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Nenhuma automação criada ainda
              </p>
              <Link
                href="/automation/new"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium inline-block"
              >
                Criar Primeira Automação
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {automations.map((automation) => (
                <Link
                  key={automation.id}
                  href={`/automation/${automation.id}`}
                  className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {automation.name}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                          {automation.match_type}
                        </span>
                        {automation.triggers.map((trigger) => (
                          <span
                            key={trigger}
                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Palavras-chave: {automation.keywords.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          automation.active
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {automation.active ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
