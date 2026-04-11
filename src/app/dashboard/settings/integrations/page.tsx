"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Key,
  Copy,
  RefreshCw,
  Trash2,
  Check,
  Terminal,
  Eye,
  EyeOff,
  ExternalLink,
  Plug,
  Camera,
  Zap,
  Globe,
} from "lucide-react";

interface ApiKeyRecord {
  id: string;
  key: string;
  name: string;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function IntegrationsPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [newKeyFull, setNewKeyFull] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function generateKey() {
    setGenerating(true);
    setNewKeyFull(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Lightroom Integration" }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewKeyFull(data.key);
        await fetchKeys();
      }
    } finally {
      setGenerating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    await fetchKeys();
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    const activeKey = keys.find((k) => k.isActive);
    if (!activeKey) {
      setTestResult({ ok: false, message: "No active API key found. Generate one first." });
      setTesting(false);
      return;
    }
    try {
      const res = await fetch("/api/keys/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeKey.key}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setTestResult({
        ok: res.ok,
        message: res.ok ? "Connection successful! API key is valid." : data.error || "Connection failed",
      });
    } catch {
      setTestResult({ ok: false, message: "Network error" });
    } finally {
      setTesting(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleReveal(id: string) {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const uploadEndpoint = `${appUrl}/api/upload/lightroom`;
  const curlExample = `curl -X POST ${uploadEndpoint} \\
  -H "Authorization: Bearer fq_live_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"galleryId": "your-gallery-id", "photoUrl": "https://example.com/photo.jpg"}'`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Integrations</h1>
          <p className="mt-2 text-gray-600">
            Connect external tools to your Fotiqo account via API.
          </p>
        </div>

        {/* Lightroom Integration */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <Camera className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">
                Adobe Lightroom Integration
              </h2>
              <p className="text-sm text-gray-500">
                Export photos directly from Lightroom to your Fotiqo galleries
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* API Keys */}
            <div>
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
                API Keys
              </h3>

              {loading ? (
                <div className="animate-pulse h-12 bg-gray-100 rounded-lg" />
              ) : keys.length === 0 ? (
                <p className="text-sm text-gray-500 mb-3">
                  No API keys yet. Generate one to get started.
                </p>
              ) : (
                <div className="space-y-3 mb-4">
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                        k.isActive
                          ? "border-gray-200 bg-gray-50"
                          : "border-red-100 bg-red-50 opacity-60"
                      }`}
                    >
                      <Key className="w-4 h-4 text-gray-400 shrink-0" />
                      <code className="text-sm font-mono flex-1 truncate">
                        {revealedKeys.has(k.id) ? k.key : k.key}
                      </code>
                      <button
                        onClick={() => toggleReveal(k.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                        title={revealedKeys.has(k.id) ? "Hide" : "Show"}
                      >
                        {revealedKeys.has(k.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(k.key, k.id)}
                        className="p-1.5 text-gray-400 hover:text-brand-500 transition"
                        title="Copy"
                      >
                        {copied === k.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {k.isActive && (
                        <button
                          onClick={() => revokeKey(k.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition"
                          title="Revoke"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {!k.isActive && (
                        <span className="text-xs text-red-500 font-medium">Revoked</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* New key alert */}
              {newKeyFull && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    New API key generated. Copy it now -- it will not be shown in full again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-white px-3 py-1.5 rounded border border-green-200 flex-1 truncate">
                      {newKeyFull}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newKeyFull, "newkey")}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                    >
                      {copied === "newkey" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={generateKey}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
                  />
                  {keys.some((k) => k.isActive) ? "Regenerate Key" : "Generate Key"}
                </button>
                <button
                  onClick={testConnection}
                  disabled={testing || !keys.some((k) => k.isActive)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <Zap className={`w-4 h-4 ${testing ? "animate-pulse" : ""}`} />
                  Test Connection
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm ${
                    testResult.ok
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {testResult.ok ? (
                    <Check className="w-4 h-4 inline mr-1" />
                  ) : null}
                  {testResult.message}
                </div>
              )}
            </div>

            {/* Upload Endpoint */}
            <div>
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
                Upload Endpoint
              </h3>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-gray-100 px-4 py-2.5 rounded-lg border border-gray-200 flex-1 truncate">
                  POST {uploadEndpoint}
                </code>
                <button
                  onClick={() => copyToClipboard(uploadEndpoint, "endpoint")}
                  className="p-2.5 text-gray-400 hover:text-brand-500 border border-gray-200 rounded-lg transition"
                >
                  {copied === "endpoint" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Setup Instructions */}
            <div>
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">
                Setup Instructions
              </h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Install the{" "}
                    <strong>HTTP Export</strong> plugin in Adobe Lightroom (File &rarr; Plug-in Manager &rarr; Add).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Set the export URL to{" "}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {uploadEndpoint}
                    </code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Add a custom header:{" "}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <span>
                    Select photos in Lightroom and export. They will appear in your linked gallery automatically.
                  </span>
                </li>
              </ol>
            </div>

            {/* cURL Example */}
            <div>
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                cURL Example
              </h3>
              <div className="relative">
                <pre className="bg-navy-900 text-green-400 text-xs font-mono p-4 rounded-lg overflow-x-auto leading-relaxed">
                  {curlExample}
                </pre>
                <button
                  onClick={() => copyToClipboard(curlExample, "curl")}
                  className="absolute top-2 right-2 p-1.5 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
                >
                  {copied === "curl" ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Other Integrations */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-navy-900">Other Integrations</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Capture One */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-navy-900">Capture One</h3>
                <p className="text-xs text-gray-500">
                  Use the same API key and endpoint as Lightroom
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                Same API
              </span>
            </div>

            {/* Zapier */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-navy-900">Zapier</h3>
                <p className="text-xs text-gray-500">
                  Automate workflows between Fotiqo and 5,000+ apps
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                Coming Soon
              </span>
            </div>

            {/* WordPress */}
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-navy-900">WordPress</h3>
                <p className="text-xs text-gray-500">
                  Embed galleries and booking widgets on your WordPress site
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
