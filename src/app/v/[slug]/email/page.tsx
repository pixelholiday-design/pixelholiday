"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Mail, Send, FileText, Archive, Trash2, Star, Search, Plus,
  ChevronLeft, Loader2, Inbox, RefreshCw, Paperclip, X, Sparkles, ArrowLeft,
} from "lucide-react";

type EmailMessage = {
  id: string;
  subject: string;
  fromAddress: string;
  fromName: string | null;
  toAddress: string;
  bodyText: string | null;
  bodyHtml: string | null;
  snippet: string | null;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
  createdAt: string;
  attachments?: { name: string; size: number }[];
};

type FolderTab = {
  key: string;
  label: string;
  icon: React.ElementType;
};

const FOLDERS: FolderTab[] = [
  { key: "INBOX", label: "Inbox", icon: Inbox },
  { key: "SENT", label: "Sent", icon: Send },
  { key: "DRAFTS", label: "Drafts", icon: FileText },
  { key: "ARCHIVE", label: "Archive", icon: Archive },
  { key: "TRASH", label: "Trash", icon: Trash2 },
];

export default function VenueEmailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [orgInfo, setOrgInfo] = useState<{ brandPrimaryColor: string | null; name: string; brandName: string | null } | null>(null);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupFormat, setSetupFormat] = useState("firstname.lastname");

  const [activeFolder, setActiveFolder] = useState("INBOX");
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);

  const primaryColor = orgInfo?.brandPrimaryColor || "#0EA5A5";
  const companyName = orgInfo?.brandName || orgInfo?.name || "Company";

  useEffect(() => {
    async function init() {
      try {
        const orgRes = await fetch(`/api/v/${slug}/dashboard`);
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setOrgInfo({
            brandPrimaryColor: orgData.org?.brandPrimaryColor || null,
            name: orgData.org?.name || "Company",
            brandName: orgData.org?.brandName || null,
          });
        }

        const inboxRes = await fetch("/api/email/inbox?folder=INBOX&limit=1");
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          setEmailAddress(inboxData.emailAddress || null);
          setNeedsSetup(false);
        } else if (inboxRes.status === 404) {
          setNeedsSetup(true);
        }
      } catch {
        setNeedsSetup(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  const fetchEmails = useCallback(async () => {
    setEmailsLoading(true);
    try {
      const params = new URLSearchParams({ folder: activeFolder, limit: "50" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/email/inbox?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data.messages || []);
        if (data.emailAddress) setEmailAddress(data.emailAddress);
      }
    } catch {
      /* ignore */
    } finally {
      setEmailsLoading(false);
    }
  }, [activeFolder, searchQuery]);

  useEffect(() => {
    if (!needsSetup && !loading && emailAddress) {
      fetchEmails();
    }
  }, [needsSetup, loading, emailAddress, fetchEmails]);

  async function handleSetup() {
    setSetupLoading(true);
    try {
      const res = await fetch("/api/email/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredFormat: setupFormat }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailAddress(data.email?.emailAddress || null);
        setNeedsSetup(false);
      } else {
        const err = await res.json();
        if (err.email) {
          setEmailAddress(err.email.emailAddress);
          setNeedsSetup(false);
        } else {
          alert(err.error || "Setup failed");
        }
      }
    } catch {
      alert("Failed to set up email");
    } finally {
      setSetupLoading(false);
    }
  }

  async function openEmail(msg: EmailMessage) {
    setDetailLoading(true);
    setSelectedEmail(msg);
    try {
      const res = await fetch(`/api/email/${msg.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedEmail(full);
        if (!msg.isRead) {
          setEmails((prev) => prev.map((e) => e.id === msg.id ? { ...e, isRead: true } : e));
        }
      }
    } catch {
      /* keep the preview data */
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleStar(e: React.MouseEvent, msg: EmailMessage) {
    e.stopPropagation();
    const newVal = !msg.isStarred;
    setEmails((prev) => prev.map((em) => em.id === msg.id ? { ...em, isStarred: newVal } : em));
    try {
      await fetch(`/api/email/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: newVal }),
      });
    } catch {
      setEmails((prev) => prev.map((em) => em.id === msg.id ? { ...em, isStarred: !newVal } : em));
    }
  }

  async function moveToTrash(id: string) {
    try {
      await fetch(`/api/email/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "TRASH" }),
      });
      setEmails((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
    } catch {
      /* ignore */
    }
  }

  async function archiveEmail(id: string) {
    try {
      await fetch(`/api/email/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "ARCHIVE" }),
      });
      setEmails((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
    } catch {
      /* ignore */
    }
  }

  async function handleSend() {
    if (!composeTo.trim() || !composeSubject.trim()) return;
    setComposeSending(true);
    try {
      const res = await fetch("/api/email/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo.trim(),
          subject: composeSubject.trim(),
          bodyText: composeBody,
          bodyHtml: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;">${composeBody.replace(/\n/g, "<br/>")}</div>`,
        }),
      });
      if (res.ok) {
        setShowCompose(false);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
        if (activeFolder === "SENT") fetchEmails();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send");
      }
    } catch {
      alert("Failed to send email");
    } finally {
      setComposeSending(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isThisYear = d.getFullYear() === now.getFullYear();
    if (isThisYear) return d.toLocaleDateString([], { month: "short", day: "numeric" });
    return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
          <Link href={`/v/${slug}/dashboard`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
              <Mail className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Set Up Your Email</h1>
            <p className="text-gray-500 mt-2">Get your professional {companyName} email address</p>
          </div>

          <div className="mb-6 p-4 rounded-xl border-2" style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}05` }}>
            <p className="text-sm text-gray-600 mb-1">Your email will look like:</p>
            <p className="text-lg font-mono font-semibold" style={{ color: primaryColor }}>
              nikos@{slug.toLowerCase().replace(/[^a-z0-9]/g, "")}.fotiqo.com
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email format</label>
            <select
              value={setupFormat}
              onChange={(e) => setSetupFormat(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ focusRingColor: primaryColor } as any}
            >
              <option value="firstname.lastname">firstname.lastname</option>
              <option value="firstname">firstname</option>
              <option value="firstnamelastname">firstnamelastname</option>
              <option value="initials.specialty">initials</option>
            </select>
          </div>

          <button
            onClick={handleSetup}
            disabled={setupLoading}
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {setupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {setupLoading ? "Setting up..." : "Create My Email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href={`/v/${slug}/dashboard`} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Email &mdash; {companyName}</h1>
            <p className="text-xs text-gray-500">{emailAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEmails()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${emailsLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" /> Compose
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Folder Tabs */}
        <aside className="w-48 bg-white border-r flex-shrink-0 hidden md:flex flex-col py-2">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.key;
            return (
              <button
                key={f.key}
                onClick={() => { setActiveFolder(f.key); setSelectedEmail(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? "text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
                style={isActive ? { backgroundColor: primaryColor } : undefined}
              >
                <Icon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
        </aside>

        {/* Mobile folder tabs */}
        <div className="md:hidden flex border-b bg-white overflow-x-auto flex-shrink-0">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.key;
            return (
              <button
                key={f.key}
                onClick={() => { setActiveFolder(f.key); setSelectedEmail(null); }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                  isActive ? "border-current" : "border-transparent text-gray-500"
                }`}
                style={isActive ? { color: primaryColor } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Email List */}
        <div className={`flex-1 flex flex-col ${selectedEmail ? "hidden md:flex" : "flex"} md:max-w-md border-r bg-white`}>
          {/* Search */}
          <form onSubmit={handleSearch} className="p-3 border-b">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search emails..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); setSearchQuery(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Email entries */}
          <div className="flex-1 overflow-y-auto">
            {emailsLoading && emails.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No emails in {activeFolder.toLowerCase()}</p>
              </div>
            ) : (
              emails.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => openEmail(msg)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                    selectedEmail?.id === msg.id ? "bg-blue-50" : ""
                  } ${!msg.isRead ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => toggleStar(e, msg)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${msg.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${!msg.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                          {msg.fromName || msg.fromAddress}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className={`text-sm truncate ${!msg.isRead ? "font-medium text-gray-800" : "text-gray-600"}`}>
                        {msg.subject || "(no subject)"}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {msg.snippet || msg.bodyText?.slice(0, 80) || ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Email Detail */}
        <div className={`flex-1 bg-white flex flex-col ${selectedEmail ? "flex" : "hidden md:flex"}`}>
          {selectedEmail ? (
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 flex-1 truncate">
                  {selectedEmail.subject || "(no subject)"}
                </h2>
                <button onClick={() => archiveEmail(selectedEmail.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Archive">
                  <Archive className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => moveToTrash(selectedEmail.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Delete">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                        {(selectedEmail.fromName || selectedEmail.fromAddress)?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{selectedEmail.fromName || selectedEmail.fromAddress}</p>
                        <p className="text-xs text-gray-500">{selectedEmail.fromAddress}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          To: {selectedEmail.toAddress} &middot; {new Date(selectedEmail.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedEmail.bodyHtml ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {selectedEmail.bodyText || "No content"}
                      </div>
                    )}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" /> {selectedEmail.attachments.length} Attachment(s)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmail.attachments.map((att, i) => (
                            <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg border text-xs text-gray-600">
                              {att.name} ({(att.size / 1024).toFixed(0)} KB)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="border-t px-4 py-3">
                <button
                  onClick={() => {
                    setComposeTo(selectedEmail.fromAddress);
                    setComposeSubject(`Re: ${selectedEmail.subject || ""}`);
                    setShowCompose(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Reply
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30">
          <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">New Message</h3>
              <button onClick={() => setShowCompose(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">From</label>
                <p className="text-sm text-gray-700 font-mono">{emailAddress}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">To</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as any}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as any}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Message</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={10}
                  placeholder="Write your message..."
                  className="w-full mt-1 px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as any}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Attach file">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={handleSend}
                disabled={composeSending || !composeTo.trim() || !composeSubject.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {composeSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {composeSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
