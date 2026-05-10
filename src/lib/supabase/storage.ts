import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export type UploadOptions = {
  bucket?: string;
  folder?: string;
  maxSizeBytes?: number;
};

function getExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() ?? "" : "";
}

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
}

export function validateImageFile(file: File, maxSizeBytes = DEFAULT_MAX_SIZE) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "File harus berupa PNG, JPG, JPEG, atau WEBP.";
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Ekstensi file harus png, jpg, jpeg, atau webp.";
  }

  if (file.size > maxSizeBytes) {
    return `Ukuran file maksimal ${Math.floor(maxSizeBytes / (1024 * 1024))}MB.`;
  }

  return null;
}

export async function uploadImageToSupabase(file: File, options?: UploadOptions) {
  const bucket = options?.bucket ?? "ecommerce-assets";
  const folder = options?.folder ?? "uploads";
  const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE;

  const validationError = validateImageFile(file, maxSizeBytes);
  if (validationError) {
    return { ok: false as const, error: validationError };
  }

  const envReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!envReady) {
    return { ok: false as const, error: "Supabase env belum tersedia." };
  }

  try {
    const supabase = createClient();
    const extension = getExtension(file.name);
    const safeName = sanitizeFileName(file.name.replace(`.${extension}`, ""));
    const filePath = `${folder}/${Date.now()}-${safeName}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      console.warn("[storage] upload failed:", uploadError.message);
      return { ok: false as const, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { ok: true as const, publicUrl: data.publicUrl, path: filePath };
  } catch {
    return { ok: false as const, error: "Upload image gagal." };
  }
}
