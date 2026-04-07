"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pixelholiday.local");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setErr("Invalid credentials");
    else router.push("/admin/upload");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-100">
      <form onSubmit={onSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-5">
        <h1 className="text-3xl font-bold text-stone-900">PixelHoliday</h1>
        <p className="text-stone-500 text-sm">Sign in to your studio</p>
        <input className="w-full border rounded-lg px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full border rounded-lg px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {err && <p className="text-rose-600 text-sm">{err}</p>}
        <button disabled={loading} className="w-full bg-stone-900 text-white rounded-lg py-2 font-medium hover:bg-stone-800 disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
