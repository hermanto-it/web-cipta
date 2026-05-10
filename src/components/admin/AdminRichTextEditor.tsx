"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

export type AdminRichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
};

const BUTTON_BASE =
  "rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:border-[#e7000b]/60 hover:bg-[#EAECED] hover:text-[#e7000b]";

export function AdminRichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Tulis konten...",
  minHeightClassName = "min-h-[160px]",
}: AdminRichTextEditorProps) {
  const isSyncingFromExternalRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (isSyncingFromExternalRef.current) return;
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `ProseMirror w-full ${minHeightClassName} rounded-b-xl bg-white px-4 py-3 text-sm text-slate-800 outline-none`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (!editor.isFocused && value !== currentHtml) {
      isSyncingFromExternalRef.current = true;
      editor.commands.setContent(value || "", { emitUpdate: false });
      isSyncingFromExternalRef.current = false;
    }
  }, [editor, value]);

  const applyLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL", previousUrl ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  const applyImage = () => {
    if (!editor) return;
    const url = window.prompt("Masukkan URL gambar", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    editor.chain().focus().setImage({ src: trimmed }).run();
  };

  if (!editor) {
    return (
      <div className="text-sm">
        <span className="mb-1 block font-medium text-slate-800">{label}</span>
        <div className="rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="admin-rich-editor text-sm">
      <span className="mb-1 block font-medium text-slate-800">{label}</span>
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 focus-within:ring-2 focus-within:ring-[#e7000b]/35">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-2.5 py-2">
          <select
            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:border-[#e7000b]/60 hover:bg-white"
            value={
              editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                    ? "h4"
                    : "paragraph"
            }
            onChange={(event) => {
              const command = event.target.value;
              if (command === "paragraph") {
                editor.chain().focus().setParagraph().run();
                return;
              }
              editor.chain().focus().toggleHeading({ level: Number(command.replace("h", "")) as 2 | 3 | 4 }).run();
            }}
          >
            <option value="paragraph">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <button type="button" className={`${BUTTON_BASE} ${editor.isActive("bold") ? "border-[#e7000b]/50 bg-red-50 text-[#e7000b]" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}>
            B
          </button>
          <button type="button" className={`${BUTTON_BASE} ${editor.isActive("italic") ? "border-[#e7000b]/50 bg-red-50 text-[#e7000b]" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}>
            I
          </button>
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={applyLink}>
            Link
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" className={`${BUTTON_BASE} ${editor.isActive("bulletList") ? "border-[#e7000b]/50 bg-red-50 text-[#e7000b]" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            • List
          </button>
          <button type="button" className={`${BUTTON_BASE} ${editor.isActive("orderedList") ? "border-[#e7000b]/50 bg-red-50 text-[#e7000b]" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            1. List
          </button>
          <button type="button" className={`${BUTTON_BASE} ${editor.isActive("blockquote") ? "border-[#e7000b]/50 bg-red-50 text-[#e7000b]" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            Quote
          </button>
          <button
            type="button"
            className={BUTTON_BASE}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            Table
          </button>
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={applyImage}>
            Image
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            Left
          </button>
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            Center
          </button>
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            Right
          </button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().undo().run()}>
            Undo
          </button>
          <button type="button" className={BUTTON_BASE} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().redo().run()}>
            Redo
          </button>
        </div>

        <EditorContent editor={editor} onClick={() => editor.commands.focus()} />
      </div>
    </div>
  );
}
