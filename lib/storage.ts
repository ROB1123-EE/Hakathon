import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Pluggable storage. `local` writes to /public/uploads and works with zero setup.
 * An S3/Cloudinary driver only needs to implement the same `save` signature.
 */
export interface StorageDriver {
  save(file: File): Promise<string>;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Please upload a JPG, PNG or WEBP image.";
  if (file.size > MAX_BYTES) return "Images must be smaller than 5 MB.";
  return null;
}

const localDriver: StorageDriver = {
  async save(file: File) {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const name = `${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  },
};

const remoteDriver: StorageDriver = {
  async save(file: File) {
    // Wire an S3/Cloudinary SDK here. Until credentials exist we fall back to local
    // storage so the application always works.
    return localDriver.save(file);
  },
};

export function getStorage(): StorageDriver {
  return process.env.STORAGE_PROVIDER === "s3" && process.env.STORAGE_ACCESS_KEY
    ? remoteDriver
    : localDriver;
}

export async function saveImage(file: File): Promise<{ url?: string; error?: string }> {
  const error = validateImage(file);
  if (error) return { error };
  return { url: await getStorage().save(file) };
}
