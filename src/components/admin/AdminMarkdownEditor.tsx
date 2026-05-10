"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AdminMarkdownEditorProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
  required?: boolean;
};

function normalizeHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "<br>" || trimmed === "<div><br></div>" || trimmed === "<p><br></p>") return "";
  return value;
}

export function AdminMarkdownEditor({
  label,
  name,
  defaultValue = "",
  placeholder,
  minHeight = "160px",
  required = false,
}: AdminMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [htmlValue, setHtmlValue] = useState(defaultValue);
  const initialized = useRef(false);

  useEffect(() => {
    if (!editorRef.current || initialized.current) return;
    editorRef.current.innerHTML = defaultValue;
    initialized.current = true;
  }, [defaultValue]);

  const isEmpty = useMemo(() => normalizeHtml(htmlValue) === "", [htmlValue]);

  const exec = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
    setHtmlValue(editor.innerHTML);
  };

  const applyHeading = (value: string) => {
    if (value === "p") {
      exec("formatBlock", "p");
      return;
    }
    exec("formatBlock", value);
  };

  const applyLink = () => {
    const url = window.prompt("Masukkan URL link", "https://");
    if (!url) return;
    exec("createLink", url);
  };

  const applyImage = () => {
    const url = window.prompt("Masukkan URL gambar", "https://");
    if (!url) return;
    exec("insertImage", url);
  };

  const insertTable = () => {
    const tableHtml =
      '<table style="width:100%;border-collapse:collapse" border="1"><tbody><tr><td>Column 1</td><td>Column 2</td></tr><tr><td>Value 1</td><td>Value 2</td></tr></tbody></table><p><br></p>';
    exec("insertHTML", tableHtml);
  };

  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-800">{label}</span>
      <div className="overflow-hidden rounded-xl border border-slate-300">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-2 py-2">
          <select
            onChange={(event) => applyHeading(event.currentTarget.value)}
            className="rounded border border-slate-200 px-2 py-1 text-xs font-medium hover:border-[#DB1A1A]"
            defaultValue=""
          >
            <option value="" disabled>
              Heading
            </option>
            <option value="p">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <button type="button" onClick={() => exec("bold")} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            B
          </button>
          <button type="button" onClick={() => exec("italic")} className="rounded border border-slate-200 px-2 py-1 text-xs italic hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            I
          </button>
          <button type="button" onClick={applyLink} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Link
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => exec("insertUnorderedList")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            • List
          </button>
          <button type="button" onClick={() => exec("insertOrderedList")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            1. List
          </button>
          <button type="button" onClick={() => exec("formatBlock", "blockquote")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Quote
          </button>
          <button type="button" onClick={insertTable} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Table
          </button>
          <button type="button" onClick={applyImage} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Image
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => exec("justifyLeft")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Left
          </button>
          <button type="button" onClick={() => exec("justifyCenter")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Center
          </button>
          <button type="button" onClick={() => exec("justifyRight")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Right
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => exec("undo")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Undo
          </button>
          <button type="button" onClick={() => exec("redo")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Redo
          </button>
        </div>

        <input type="hidden" name={name} value={htmlValue} required={required} />

        <div className="relative">
          {isEmpty && placeholder ? <p className="pointer-events-none absolute left-3 top-2 text-sm text-slate-400">{placeholder}</p> : null}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              const html = editorRef.current?.innerHTML ?? "";
              setHtmlValue(html);
            }}
            onBlur={() => {
              const html = editorRef.current?.innerHTML ?? "";
              setHtmlValue(html);
            }}
            className="w-full rounded-b-xl px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]"
            style={{ minHeight }}
          />
        </div>
      </div>
    </label>
  );
}
