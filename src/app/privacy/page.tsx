import Link from "next/link";
import { Camera } from "lucide-react";

export const metadata = { title: "Privacy Policy — Pixelvo" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-navy-900">
            <Camera className="h-5 w-5 text-coral-500" />
            <span className="font-display text-xl">Pixelvo</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-stone">
        <h1 className="font-display text-4xl text-navy-900">Privacy Policy</h1>
        <p className="text-navy-400 text-sm">Last updated: April 2026</p>

        <h2 className="heading text-2xl mt-10">What we collect</h2>
        <ul className="list-disc pl-6 space-y-1 text-navy-700">
          <li><strong>Photos &amp; videos</strong> taken of you at our partner locations</li>
          <li><strong>Contact details</strong> you provide: name, email, WhatsApp number, room number</li>
          <li><strong>Face recognition vectors</strong> — only when you opt in to selfie matching</li>
          <li><strong>Device data</strong>: browser type, IP address, viewing activity within your gallery</li>
          <li><strong>Payment information</strong> — never stored by us, processed directly by Stripe</li>
        </ul>

        <h2 className="heading text-2xl mt-10">How we use it</h2>
        <ul className="list-disc pl-6 space-y-1 text-navy-700">
          <li>Deliver your photo gallery via secure magic link</li>
          <li>Process payment for unlocked or printed photos</li>
          <li>Send delivery emails &amp; WhatsApp messages</li>
          <li>Match your face to photos taken at the venue (if opted in)</li>
          <li>Send reminders if you have unpurchased photos in your cart</li>
        </ul>

        <h2 className="heading text-2xl mt-10">Face recognition (GDPR Article 9)</h2>
        <p className="text-navy-700">
          Face vectors are biometric data and are treated with extra care. They are computed locally,
          used solely to match your selfie against photos at the same venue, and <strong>permanently
          deleted from our systems immediately after the match completes</strong>. They are never
          shared with third parties.
        </p>

        <h2 className="heading text-2xl mt-10">Third parties</h2>
        <ul className="list-disc pl-6 space-y-1 text-navy-700">
          <li><strong>Stripe</strong> — payment processing (PCI-DSS Level 1)</li>
          <li><strong>Cloudinary</strong> — image transformation &amp; watermarking</li>
          <li><strong>Cloudflare R2</strong> — encrypted storage of original files</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Meta WhatsApp Cloud API</strong> — message delivery</li>
        </ul>

        <h2 className="heading text-2xl mt-10">Data retention</h2>
        <p className="text-navy-700">
          Galleries expire 7–14 days after creation (the FOMO timer shown on each page). Original
          photos are deleted from cloud storage 90 days after gallery expiry unless you've purchased
          them. Customer records can be deleted at any time on request.
        </p>

        <h2 className="heading text-2xl mt-10">Your rights (GDPR / CCPA)</h2>
        <p className="text-navy-700">
          You may request a copy or deletion of all your data at any time. Email
          <a className="text-coral-600 mx-1" href="mailto:privacy@pixelvo.com">privacy@pixelvo.com</a>
          or call our automated GDPR endpoint at <code>POST /api/gdpr/delete</code> with your
          customer email. We will respond within 30 days.
        </p>

        <h2 className="heading text-2xl mt-10">Contact</h2>
        <p className="text-navy-700">
          Data Protection Officer · <a className="text-coral-600" href="mailto:dpo@pixelvo.com">dpo@pixelvo.com</a>
        </p>

        <p className="text-xs text-navy-400 mt-12">
          See also: <Link className="text-coral-600 underline" href="/terms">Terms of Service</Link>
        </p>
      </main>
    </div>
  );
}
