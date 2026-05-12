"use client";

import { useMemo, useState } from "react";

import { uploadImageToSupabase } from "@/lib/supabase/storage";

type ImageUploadFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | null;
  folder: string;
  maxSizeMB?: number;
  onValueChange?: (value: string) => void;
};

export function ImageUploadField({ label, name, defaultValue, folder, maxSizeMB = 5, onValueChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(defaultValue ?? "");

  const preview = useMemo(() => {
    return imageUrl && imageUrl.trim().length > 0 ? imageUrl : null;
  }, [imageUrl]);

  return (
    <div className="text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input type="hidden" name={name} value={imageUrl} readOnly />

      <div className="rounded-lg border border-slate-300 p-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading}
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) {
              return;
            }

            setError(null);
            setUploading(true);
            const result = await uploadImageToSupabase(file, {
              folder,
              maxSizeBytes: maxSizeMB * 1024 * 1024,
            });
            setUploading(false);

            if (!result.ok) {
              setError(result.error);
              return;
            }

            setImageUrl(result.publicUrl);
            onValueChange?.(result.publicUrl);
          }}
          className="w-full text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">Allowed: png, jpg, jpeg, webp. Max: {maxSizeMB}MB.</p>

        {uploading ? <p className="mt-2 text-xs text-blue-600">Uploading image...</p> : null}
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

        {preview ? (
          <div className="mt-3">
            <p className="mb-1 text-xs text-slate-500">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Uploaded preview" className="h-28 w-full rounded-md border border-slate-200 object-cover" />
          </div>
        ) : null}

        {imageUrl ? (
          <button
            type="button"
            onClick={() => {
              setImageUrl("");
              onValueChange?.("");
            }}
            className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            Clear image
          </button>
        ) : null}
      </div>
    </div>
  );
}
