"use client";

import { useRef } from "react";

type AdminMarkdownEditorProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

const templates = {
  heading: "## Heading",
  bold: "**text**",
  italic: "*text*",
  link: "[text](https://)",
  bullet: "- item",
  numbered: "1. item",
  quote: "> quote",
  table: "| Column 1 | Column 2 |\n| --- | --- |\n| Value 1 | Value 2 |",
  image: "![alt text](image-url)",
};

export function AdminMarkdownEditor({ label, name, defaultValue = "", placeholder, rows = 4, required = false }: AdminMarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const insertion = `${before}${before.endsWith("\n") || before.length === 0 ? "" : "\n"}${template}${after.startsWith("\n") || after.length === 0 ? "" : "\n"}${after}`;

    textarea.value = insertion;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + template.length;
  };

  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-800">{label}</span>
      <div className="overflow-hidden rounded-xl border border-slate-300">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-2 py-2">
          <button type="button" onClick={() => insertTemplate(templates.heading)} className="rounded border border-slate-200 px-2 py-1 text-xs font-medium hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            H
          </button>
          <button type="button" onClick={() => insertTemplate(templates.bold)} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            B
          </button>
          <button type="button" onClick={() => insertTemplate(templates.italic)} className="rounded border border-slate-200 px-2 py-1 text-xs italic hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            I
          </button>
          <button type="button" onClick={() => insertTemplate(templates.link)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Link
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => insertTemplate(templates.bullet)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            • List
          </button>
          <button type="button" onClick={() => insertTemplate(templates.numbered)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            1. List
          </button>
          <button type="button" onClick={() => insertTemplate(templates.quote)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Quote
          </button>
          <button type="button" onClick={() => insertTemplate(templates.table)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Table
          </button>
          <button type="button" onClick={() => insertTemplate(templates.image)} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Image
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => document.execCommand("undo")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Undo
          </button>
          <button type="button" onClick={() => document.execCommand("redo")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Redo
          </button>
        </div>

        <textarea
          ref={textareaRef}
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-b-xl px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]"
        />
      </div>
    </label>
  );
}
