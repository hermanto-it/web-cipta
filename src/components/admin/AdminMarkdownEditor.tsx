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

function normalizeEmptyHtml(value: string) {
  return normalizeHtml(value);
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

  const syncValue = () => {
    const html = editorRef.current?.innerHTML ?? "";
    setHtmlValue(normalizeEmptyHtml(html));
  };

  const setCaretToEnd = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const ensureListFallback = (tag: "ul" | "ol") => {
    const editor = editorRef.current;
    if (!editor) return;
    const normalized = normalizeHtml(editor.innerHTML);
    const hasList = /<(ul|ol)\b/i.test(normalized);
    if (hasList) return;
    editor.innerHTML = `<${tag}><li><br></li></${tag}>`;
    setCaretToEnd();
    syncValue();
  };

  const runCommand = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
    syncValue();
  };

  const applyHeading = (value: string) => {
    if (value === "p") {
      runCommand("formatBlock", "p");
      return;
    }
    runCommand("formatBlock", value);
  };

  const applyLink = () => {
    const url = window.prompt("Masukkan URL link", "https://");
    if (!url) return;
    runCommand("createLink", url);
  };

  const applyImage = () => {
    const url = window.prompt("Masukkan URL gambar", "https://");
    if (!url) return;
    runCommand("insertImage", url);
  };

  const insertTable = () => {
    const tableHtml =
      '<table style="width:100%;border-collapse:collapse" border="1"><tbody><tr><td>Column 1</td><td>Column 2</td></tr><tr><td>Value 1</td><td>Value 2</td></tr></tbody></table><p><br></p>';
    runCommand("insertHTML", tableHtml);
  };

  const applyUnorderedList = () => {
    runCommand("insertUnorderedList");
    ensureListFallback("ul");
  };

  const applyOrderedList = () => {
    runCommand("insertOrderedList");
    ensureListFallback("ol");
  };

  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-800">{label}</span>
      <div
        className="overflow-hidden rounded-xl border border-slate-300 focus-within:border-[#DB1A1A] focus-within:ring-1 focus-within:ring-[#DB1A1A]"
        onClick={() => editorRef.current?.focus()}
      >
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
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            B
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")} className="rounded border border-slate-200 px-2 py-1 text-xs italic hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            I
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={applyLink} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Link
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={applyUnorderedList} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            • List
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={applyOrderedList} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            1. List
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "blockquote")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Quote
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertTable} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Table
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={applyImage} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Image
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("justifyLeft")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Left
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("justifyCenter")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Center
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("justifyRight")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Right
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("undo")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
            Undo
          </button>
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("redo")} className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-[#DB1A1A] hover:text-[#DB1A1A]">
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
            role="textbox"
            tabIndex={0}
            onInput={() => {
              syncValue();
            }}
            onBlur={() => {
              syncValue();
            }}
            className="w-full cursor-text rounded-b-xl bg-white px-4 py-3 text-sm text-slate-800 outline-none pointer-events-auto"
            style={{ minHeight }}
          />
        </div>
      </div>
    </label>
  );
}
