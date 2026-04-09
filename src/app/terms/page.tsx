import Link from "next/link";
import { Camera } from "lucide-react";

export const metadata = { title: "Terms of Service — Fotiqo" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-navy-900">
            <Camera className="h-5 w-5 text-coral-500" />
            <span className="font-display text-xl">Fotiqo</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-stone">
        <h1 className="font-display text-4xl text-navy-900">Terms of Service</h1>
        <p className="text-navy-400 text-sm">Last updated: April 2026</p>

        <h2 className="heading text-2xl mt-10">For customers</h2>
        <h3 className="font-semibold mt-4">Gallery access</h3>
        <p className="text-navy-700">
          Each gallery is accessed via a unique magic link. Treat it like a password — anyone with
          the link can view your photos until expiry. Galleries expire 7–14 days from creation; the
          countdown is shown on the gallery page.
        </p>

        <h3 className="font-semibold mt-4">Payments</h3>
        <p className="text-navy-700">
          All payments are processed by Stripe. Prices are shown in EUR (€) unless otherwise noted
          and include VAT where applicable. Charges appear on your statement as
          <code className="mx-1">FOTIQO</code>.
        </p>

        <h3 className="font-semibold mt-4">Refund policy</h3>
        <p className="text-navy-700">
          Digital downloads are non-refundable once the gallery is unlocked. Printed products may be
          refunded within 14 days if they arrive damaged or significantly different from the
          preview. Email <a className="text-coral-600" href="mailto:support@fotiqo.com">support@fotiqo.com</a>.
        </p>

        <h3 className="font-semibold mt-4">Intellectual property</h3>
        <p className="text-navy-700">
          Photos are the intellectual property of the photographer / studio. By purchasing, you
          receive a non-exclusive personal license to use them for non-commercial purposes
          (printing, social sharing, family use). Commercial use requires written permission.
        </p>

        <h2 className="heading text-2xl mt-10">For SaaS subscribers (photographers / studios)</h2>
        <ul className="list-disc pl-6 space-y-1 text-navy-700">
          <li>Subscriptions billed monthly via Stripe; cancel anytime in account settings.</li>
          <li>You retain full ownership of all photos uploaded to the platform.</li>
          <li>Fotiqo charges a 2% commission on each sale processed through the platform.</li>
          <li>Cancellation: data is retained for 30 days after cancellation, then permanently deleted.</li>
          <li>Service availability target: 99.5% uptime, measured monthly.</li>
        </ul>

        <h2 className="heading text-2xl mt-10">Limitation of liability</h2>
        <p className="text-navy-700">
          Fotiqo is provided "as is". To the maximum extent permitted by law, we are not
          liable for indirect or consequential damages, loss of profits, or data loss beyond the
          amount paid in the previous 12 months.
        </p>

        <p className="text-xs text-navy-400 mt-12">
          See also: <Link className="text-coral-600 underline" href="/privacy">Privacy Policy</Link>
        </p>
      </main>
    </div>
  );
}
