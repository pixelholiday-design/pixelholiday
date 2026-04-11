"use client";

import { useState } from "react";
import { Code, Eye, EyeOff } from "lucide-react";

interface Props {
  html: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

// Basic sanitization: strip dangerous tags/attributes
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<input[\s\S]*?>/gi, "");
}

export default function CustomHtmlBlock({ html, onChange, editable = false }: Props) {
  const [showPreview, setShowPreview] = useState(true);
  const [code, setCode] = useState(html);

  if (!editable) {
    return (
      <div
        className="custom-html-block"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
    );
  }

  return (
    <div className="border border-cream-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-cream-50 px-4 py-2 border-b border-cream-200">
        <div className="flex items-center gap-2 text-sm font-medium text-navy-700">
          <Code className="h-4 w-4" />
          Custom HTML
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-700"
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div
          className="p-4 min-h-[100px] custom-html-block"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(code) }}
        />
      ) : (
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onChange?.(e.target.value);
          }}
          rows={10}
          className="w-full p-4 font-mono text-sm text-navy-800 bg-navy-900 text-green-400 border-0 focus:ring-0 resize-y"
          placeholder="<div>Your custom HTML here...</div>"
        />
      )}
    </div>
  );
}
