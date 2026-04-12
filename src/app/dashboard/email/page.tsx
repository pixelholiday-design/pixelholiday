"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Send,
  FileText,
  Archive,
  Trash2,
  Star,
  Search,
  Plus,
  ChevronLeft,
  Loader2,
  Inbox,
  RefreshCw,
  MoreHorizontal,
  Paperclip,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Copy,
  Settings,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmailMessage {
  id: string;
  from: { name: string; email: string };
  to: string;
  cc?: string;
  subject: string;
  body: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  folder: Folder;
  hasAttachments: boolean;
  aiSuggestedReply?: string;
}

type Folder = "INBOX" | "SENT" | "DRAFTS" | "ARCHIVE" | "TRASH";

type EmailFormat = "firstname.lastname" | "firstnamelastname" | "firstname";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncate(text: string, len: number): string {
  if (!text) return "";
  return text.length > len ? text.slice(0, len) + "..." : text;
}

// ---------------------------------------------------------------------------
// Folder config
// ---------------------------------------------------------------------------

const FOLDERS: { key: Folder; label: string; icon: React.ReactNode }[] = [
  { key: "INBOX", label: "Inbox", icon: <Inbox className="w-4 h-4" /> },
  { key: "SENT", label: "Sent", icon: <Send className="w-4 h-4" /> },
  { key: "DRAFTS", label: "Drafts", icon: <FileText className="w-4 h-4" /> },
  { key: "ARCHIVE", label: "Archive", icon: <Archive className="w-4 h-4" /> },
  { key: "TRASH", label: "Trash", icon: <Trash2 className="w-4 h-4" /> },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmailPage() {
  // State
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [composing, setComposing] = useState(false);
  const [folder, setFolder] = useState<Folder>("INBOX");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fotiqoEmail, setFotiqoEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSetup, setShowSetup] = useState(false);

  // Setup state
  const [emailFormat, setEmailFormat] = useState<EmailFormat>("firstname.lastname");
  const [settingUp, setSettingUp] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeCc, setComposeCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [signature, setSignature] = useState("");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // AI reply
  const [showAiReply, setShowAiReply] = useState(false);

  // ------------------------------------------
  // Data fetching
  // ------------------------------------------

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/email/unread-count");
      if (res.status === 404 || !res.ok) {
        setShowSetup(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setFotiqoEmail(data.email);
      setUnreadCount(data.count ?? 0);
      setShowSetup(false);
    } catch {
      setShowSetup(true);
      setLoading(false);
    }
  }, []);

  const fetchEmails = useCallback(async () => {
    if (!fotiqoEmail) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ folder, search, page: "1" });
      const res = await fetch(`/api/email/inbox?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails ?? []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [fotiqoEmail, folder, search]);

  const fetchSignature = useCallback(async () => {
    if (!fotiqoEmail) return;
    try {
      const res = await fetch("/api/email/generate-signature");
      if (res.ok) {
        const data = await res.json();
        setSignature(data.signature ?? "");
      }
    } catch {
      // silently handle
    }
  }, [fotiqoEmail]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (fotiqoEmail) {
      fetchEmails();
      fetchSignature();
    }
  }, [fotiqoEmail, folder, search, fetchEmails, fetchSignature]);

  // ------------------------------------------
  // Actions
  // ------------------------------------------

  const handleSetup = async () => {
    setSettingUp(true);
    try {
      const res = await fetch("/api/email/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: emailFormat }),
      });
      if (res.ok) {
        const data = await res.json();
        setFotiqoEmail(data.email);
        setShowSetup(false);
      }
    } catch {
      // handle error
    } finally {
      setSettingUp(false);
    }
  };

  const handleSend = async () => {
    if (!composeTo || !composeSubject) return;
    setSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          cc: composeCc || undefined,
          subject: composeSubject,
          body: composeBody + (signature ? `\n\n${signature}` : ""),
        }),
      });
      if (res.ok) {
        setComposing(false);
        resetCompose();
        fetchEmails();
      }
    } catch {
      // handle error
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await fetch("/api/email/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          cc: composeCc || undefined,
          subject: composeSubject,
          body: composeBody,
        }),
      });
      setComposing(false);
      resetCompose();
      if (folder === "DRAFTS") fetchEmails();
    } catch {
      // handle
    }
  };

  const handleOpenEmail = async (email: EmailMessage) => {
    setSelectedEmail(email);
    setShowAiReply(false);
    if (!email.isRead) {
      try {
        await fetch(`/api/email/${email.id}`, { method: "GET" });
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // handle
      }
    }
  };

  const handleUpdateEmail = async (
    id: string,
    action: "star" | "archive" | "delete" | "read" | "unread"
  ) => {
    try {
      await fetch(`/api/email/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (action === "archive" || action === "delete") {
        setEmails((prev) => prev.filter((e) => e.id !== id));
        if (selectedEmail?.id === id) setSelectedEmail(null);
      } else if (action === "star") {
        setEmails((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, isStarred: !e.isStarred } : e
          )
        );
      } else if (action === "read") {
        setEmails((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } else if (action === "unread") {
        setEmails((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isRead: false } : e))
        );
        setUnreadCount((c) => c + 1);
      }
    } catch {
      // handle
    }
  };

  const handleBulkAction = async (action: "archive" | "delete" | "read" | "unread") => {
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => handleUpdateEmail(id, action)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetCompose = () => {
    setComposeTo("");
    setComposeCc("");
    setShowCc(false);
    setComposeSubject("");
    setComposeBody("");
  };

  const handleReply = (email: EmailMessage) => {
    setComposeTo(email.from.email);
    setComposeSubject(
      email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`
    );
    setComposeBody(
      `\n\n---\nOn ${new Date(email.date).toLocaleDateString()}, ${email.from.name} wrote:\n> ${email.body.split("\n").join("\n> ")}`
    );
    setComposing(true);
  };

  const handleForward = (email: EmailMessage) => {
    setComposeSubject(
      email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`
    );
    setComposeBody(
      `\n\n--- Forwarded message ---\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${new Date(email.date).toLocaleDateString()}\nSubject: ${email.subject}\n\n${email.body}`
    );
    setComposing(true);
  };

  const handleAiWrite = () => {
    alert("AI Write coming soon");
  };

  // ------------------------------------------
  // Render: Setup screen
  // ------------------------------------------

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">
              Get your free professional email address
            </h1>
            <p className="text-navy-500">
              Send and receive emails with your @fotiqo.com address. Impress
              your clients with a professional identity.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-sm font-medium text-navy-700 mb-2">
              Choose your format:
            </p>
            {[
              {
                value: "firstname.lastname" as EmailFormat,
                label: "sarah.wilson@fotiqo.com",
                desc: "firstname.lastname",
              },
              {
                value: "firstnamelastname" as EmailFormat,
                label: "sarahwilson@fotiqo.com",
                desc: "firstnamelastname",
              },
              {
                value: "firstname" as EmailFormat,
                label: "sarah@fotiqo.com",
                desc: "firstname",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  emailFormat === opt.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-cream-200 hover:border-cream-300"
                }`}
              >
                <input
                  type="radio"
                  name="emailFormat"
                  value={opt.value}
                  checked={emailFormat === opt.value}
                  onChange={() => setEmailFormat(opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    emailFormat === opt.value
                      ? "border-brand-500"
                      : "border-cream-300"
                  }`}
                >
                  {emailFormat === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-navy-900">
                    {opt.label}
                  </span>
                  <span className="text-xs text-navy-400 ml-2">
                    ({opt.desc})
                  </span>
                </div>
                {opt.value === "firstname.lastname" && (
                  <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </label>
            ))}
          </div>

          <button
            onClick={handleSetup}
            disabled={settingUp}
            className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {settingUp ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Create My Email
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // Render: Email detail view
  // ------------------------------------------

  if (selectedEmail) {
    return (
      <div className="min-h-screen bg-cream-50">
        {/* Header */}
        <div className="bg-white border-b border-cream-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedEmail(null)}
              className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                Back to {FOLDERS.find((f) => f.key === folder)?.label}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleUpdateEmail(selectedEmail.id, "archive")
                }
                className="p-2 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  handleUpdateEmail(selectedEmail.id, "delete")
                }
                className="p-2 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  handleUpdateEmail(selectedEmail.id, "star")
                }
                className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                title="Star"
              >
                <Star
                  className={`w-5 h-5 ${
                    selectedEmail.isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-navy-400 hover:text-yellow-500"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Email content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-navy-900 mb-6">
            {selectedEmail.subject}
          </h1>

          <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
            {/* Meta */}
            <div className="px-6 py-4 border-b border-cream-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-navy-900">
                    {selectedEmail.from.name}{" "}
                    <span className="font-normal text-navy-400 text-sm">
                      &lt;{selectedEmail.from.email}&gt;
                    </span>
                  </p>
                  <p className="text-sm text-navy-500 mt-0.5">
                    To: {selectedEmail.to}
                  </p>
                  {selectedEmail.cc && (
                    <p className="text-sm text-navy-400 mt-0.5">
                      CC: {selectedEmail.cc}
                    </p>
                  )}
                </div>
                <span className="text-sm text-navy-400">
                  {new Date(selectedEmail.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div
                className="prose prose-navy max-w-none text-navy-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />
            </div>
          </div>

          {/* AI Suggested Reply */}
          {selectedEmail.aiSuggestedReply && (
            <div className="mt-6">
              <button
                onClick={() => setShowAiReply(!showAiReply)}
                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Suggested Reply
                <ChevronLeft
                  className={`w-4 h-4 transition-transform ${
                    showAiReply ? "-rotate-90" : "rotate-0"
                  }`}
                />
              </button>
              {showAiReply && (
                <div className="mt-3 bg-brand-50 border border-brand-200 rounded-xl p-5">
                  <p className="text-navy-700 whitespace-pre-wrap leading-relaxed">
                    {selectedEmail.aiSuggestedReply}
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-brand-200">
                    <button
                      onClick={() => {
                        setComposeTo(selectedEmail.from.email);
                        setComposeSubject(
                          selectedEmail.subject.startsWith("Re:")
                            ? selectedEmail.subject
                            : `Re: ${selectedEmail.subject}`
                        );
                        setComposeBody(
                          selectedEmail.aiSuggestedReply ?? ""
                        );
                        setComposing(true);
                      }}
                      className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send AI Reply
                    </button>
                    <button
                      onClick={() => {
                        setComposeTo(selectedEmail.from.email);
                        setComposeSubject(
                          selectedEmail.subject.startsWith("Re:")
                            ? selectedEmail.subject
                            : `Re: ${selectedEmail.subject}`
                        );
                        setComposeBody(
                          selectedEmail.aiSuggestedReply ?? ""
                        );
                        setComposing(true);
                      }}
                      className="px-4 py-2 bg-white border border-brand-300 text-brand-700 text-sm font-medium rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      Edit & Send
                    </button>
                    <button
                      onClick={() => handleReply(selectedEmail)}
                      className="px-4 py-2 bg-white border border-cream-300 text-navy-600 text-sm font-medium rounded-lg hover:bg-cream-50 transition-colors"
                    >
                      Write Own Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => handleReply(selectedEmail)}
              className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Reply
            </button>
            <button
              onClick={() => handleForward(selectedEmail)}
              className="px-5 py-2.5 bg-white border border-cream-300 text-navy-700 font-medium rounded-lg hover:bg-cream-50 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Forward
            </button>
          </div>
        </div>

        {/* Compose overlay (if composing while viewing) */}
        {composing && renderCompose()}
      </div>
    );
  }

  // ------------------------------------------
  // Render: Compose panel
  // ------------------------------------------

  function renderCompose() {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-t-2xl shadow-2xl border border-cream-200 border-b-0 flex flex-col max-h-[80vh]">
            {/* Compose header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-cream-200 bg-navy-900 rounded-t-2xl">
              <span className="text-white font-medium">New Email</span>
              <button
                onClick={() => {
                  setComposing(false);
                  resetCompose();
                }}
                className="text-cream-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compose body */}
            <div className="flex-1 overflow-y-auto">
              {/* From */}
              <div className="px-5 py-2.5 border-b border-cream-100 flex items-center gap-3">
                <span className="text-sm text-navy-400 w-12">From:</span>
                <span className="text-sm text-navy-700 bg-cream-100 px-3 py-1 rounded-md">
                  {fotiqoEmail}
                </span>
              </div>

              {/* To */}
              <div className="px-5 py-2.5 border-b border-cream-100 flex items-center gap-3">
                <span className="text-sm text-navy-400 w-12">To:</span>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 text-sm text-navy-900 outline-none bg-transparent placeholder:text-navy-300"
                />
                {!showCc && (
                  <button
                    onClick={() => setShowCc(true)}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Add CC
                  </button>
                )}
              </div>

              {/* CC */}
              {showCc && (
                <div className="px-5 py-2.5 border-b border-cream-100 flex items-center gap-3">
                  <span className="text-sm text-navy-400 w-12">CC:</span>
                  <input
                    type="email"
                    value={composeCc}
                    onChange={(e) => setComposeCc(e.target.value)}
                    placeholder="cc@example.com"
                    className="flex-1 text-sm text-navy-900 outline-none bg-transparent placeholder:text-navy-300"
                  />
                </div>
              )}

              {/* Subject */}
              <div className="px-5 py-2.5 border-b border-cream-100 flex items-center gap-3">
                <span className="text-sm text-navy-400 w-12">Subj:</span>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 text-sm text-navy-900 outline-none bg-transparent placeholder:text-navy-300"
                />
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your email..."
                  rows={10}
                  className="w-full text-sm text-navy-800 outline-none resize-none bg-transparent placeholder:text-navy-300 leading-relaxed"
                />
              </div>

              {/* Signature preview */}
              {signature && (
                <div className="px-5 pb-4">
                  <div className="border-t border-cream-200 pt-3">
                    <p className="text-xs text-navy-400 mb-1">Signature:</p>
                    <div
                      className="text-xs text-navy-500 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: signature }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Compose footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-cream-200 bg-cream-50">
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-navy-400 hover:text-navy-700 hover:bg-cream-200 rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAiWrite}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Write
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 text-sm text-navy-600 hover:bg-cream-200 rounded-lg transition-colors font-medium"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !composeTo || !composeSubject}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // Render: Email list view (main)
  // ------------------------------------------

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Email</h1>
              <p className="text-sm text-navy-400">{fotiqoEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard/email/settings"
              className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Signature Settings
            </a>
            <button
              onClick={() => {
                resetCompose();
                setComposing(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Compose
            </button>
          </div>
        </div>

        {/* Folder tabs */}
        <div className="px-6 flex items-center gap-1 overflow-x-auto">
          {FOLDERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFolder(f.key);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                folder === f.key
                  ? "bg-brand-50 text-brand-600 border-b-2 border-brand-500"
                  : "text-navy-500 hover:text-navy-700 hover:bg-cream-100"
              }`}
            >
              {f.icon}
              {f.label}
              {f.key === "INBOX" && unreadCount > 0 && (
                <span className="bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="px-6 py-3 bg-white border-b border-cream-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-200 rounded-xl text-navy-900 placeholder:text-navy-300 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 transition-colors"
            />
          </div>
          <button
            onClick={fetchEmails}
            className="p-2.5 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="px-6 py-2.5 bg-brand-50 border-b border-brand-200 flex items-center gap-4">
          <span className="text-sm font-medium text-brand-700">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleBulkAction("archive")}
              className="px-3 py-1.5 text-sm text-navy-600 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={() => handleBulkAction("read")}
              className="px-3 py-1.5 text-sm text-navy-600 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Mark Read
            </button>
            <button
              onClick={() => handleBulkAction("unread")}
              className="px-3 py-1.5 text-sm text-navy-600 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              Mark Unread
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-sm text-navy-500 hover:text-navy-700"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Email list */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
            <p className="text-sm text-navy-400">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-cream-100 rounded-2xl flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-cream-400" />
            </div>
            <p className="text-navy-600 font-medium mb-1">
              {search
                ? "No emails match your search"
                : `No emails in ${FOLDERS.find((f) => f.key === folder)?.label}`}
            </p>
            <p className="text-sm text-navy-400">
              {folder === "INBOX" && !search
                ? "Emails you receive will appear here"
                : "Try a different search or folder"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-cream-200 overflow-hidden divide-y divide-cream-100">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-cream-50 cursor-pointer transition-colors group ${
                  !email.isRead ? "border-l-2 border-l-brand-500" : "border-l-2 border-l-transparent"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(email.id);
                  }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedIds.has(email.id)
                      ? "bg-brand-600 border-brand-600"
                      : "border-cream-300 hover:border-brand-400"
                  }`}
                >
                  {selectedIds.has(email.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>

                {/* Star */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateEmail(email.id, "star");
                  }}
                  className="flex-shrink-0"
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      email.isStarred
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-cream-300 hover:text-yellow-400"
                    }`}
                  />
                </button>

                {/* Content (click to open) */}
                <div
                  onClick={() => handleOpenEmail(email)}
                  className="flex-1 min-w-0 flex items-center gap-4"
                >
                  {/* Sender */}
                  <span
                    className={`w-44 flex-shrink-0 truncate text-sm ${
                      !email.isRead
                        ? "font-semibold text-navy-900"
                        : "text-navy-600"
                    }`}
                  >
                    {email.from.name}
                  </span>

                  {/* Subject + preview */}
                  <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <span
                      className={`truncate text-sm ${
                        !email.isRead
                          ? "font-semibold text-navy-900"
                          : "text-navy-700"
                      }`}
                    >
                      {email.subject}
                    </span>
                    <span className="text-sm text-navy-400 truncate hidden sm:inline">
                      &mdash; {truncate(email.preview, 60)}
                    </span>
                  </div>

                  {/* Attachment indicator */}
                  {email.hasAttachments && (
                    <Paperclip className="w-4 h-4 text-navy-300 flex-shrink-0" />
                  )}

                  {/* Time */}
                  <span
                    className={`text-xs flex-shrink-0 whitespace-nowrap ${
                      !email.isRead
                        ? "font-semibold text-navy-700"
                        : "text-navy-400"
                    }`}
                  >
                    {formatTime(email.date)}
                  </span>
                </div>

                {/* Quick actions on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateEmail(email.id, "archive");
                    }}
                    className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-cream-200 rounded-md transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateEmail(email.id, "delete");
                    }}
                    className="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose panel */}
      {composing && renderCompose()}
    </div>
  );
}
