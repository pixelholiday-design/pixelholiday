"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle } from "lucide-react";

const BUSINESS_TYPES = [
  "Freelance Photographer",
  "Wedding Photographer",
  "Resort / Hotel Operator",
  "Studio Owner",
  "Attraction / Theme Park",
  "Other",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessType: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No API call yet -- just show success state
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card p-10 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="font-display text-xl font-bold text-navy-900 mb-2">
          Message sent!
        </h3>
        <p className="text-navy-500 leading-relaxed">
          Thanks for reaching out, {form.name || "there"}. We&apos;ll get back to you
          within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="label-xs mb-1.5 block text-navy-700">
          Name <span className="text-coral-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="input w-full"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="label-xs mb-1.5 block text-navy-700">
          Email <span className="text-coral-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="input w-full"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="label-xs mb-1.5 block text-navy-700">
          Phone <span className="text-navy-400">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="input w-full"
        />
      </div>

      {/* Business type */}
      <div>
        <label htmlFor="businessType" className="label-xs mb-1.5 block text-navy-700">
          I am a&hellip; <span className="text-coral-500">*</span>
        </label>
        <select
          id="businessType"
          name="businessType"
          required
          value={form.businessType}
          onChange={handleChange}
          className="input w-full appearance-none bg-white"
        >
          <option value="" disabled>
            Select your business type
          </option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="label-xs mb-1.5 block text-navy-700">
          Message <span className="text-coral-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your photography business and how we can help..."
          className="input w-full resize-y"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral-500 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-coral-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] w-full sm:w-auto"
      >
        <Send className="h-4 w-4" />
        Send Message
      </button>
    </form>
  );
}
