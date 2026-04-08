"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300/60">
          <h2 className="heading text-xl text-navy-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-100">
            <X className="h-4 w-4 text-navy-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-navy-700 mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-coral-500 ml-0.5">*</span>}
      </div>
      {children}
      {hint && <div className="text-[11px] text-navy-400 mt-1">{hint}</div>}
    </label>
  );
}

export const inputCls =
  "w-full min-h-[44px] px-3 py-2 rounded-lg border border-cream-300 focus:border-brand-500 focus:outline-none bg-white text-navy-900 text-sm";
