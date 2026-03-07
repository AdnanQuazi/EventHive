"use server";

import { createClient } from "@/lib/supabase/server";

export type UploadResult = {
  data: { url: string } | null;
  error: string | null;
};

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name ('event-images' or 'club-images')
 * @param userId - The user ID for organizing files
 * @returns The public URL of the uploaded file or error
 */
export async function uploadImage(
  file: File,
  bucket: "event-images" | "club-images",
  userId: string
): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        data: null,
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        data: null,
        error: "File size exceeds 5MB limit.",
      };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { data: null, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { data: { url: publicUrl }, error: null };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name
 * @returns Success or error
 */
export async function deleteImage(
  url: string,
  bucket: "event-images" | "club-images"
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    // Extract file path from URL
    const urlParts = url.split(`${bucket}/`);
    if (urlParts.length < 2) {
      return { error: "Invalid image URL" };
    }
    const filePath = urlParts[1];

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

/**
 * Upload multiple images (for event gallery)
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @param userId - The user ID for organizing files
 * @param maxFiles - Maximum number of files allowed (default: 4)
 * @returns Array of uploaded URLs or error
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: "event-images" | "club-images",
  userId: string,
  maxFiles: number = 4
): Promise<{ data: string[] | null; error: string | null }> {
  try {
    if (files.length > maxFiles) {
      return {
        data: null,
        error: `Maximum ${maxFiles} images allowed`,
      };
    }

    const uploadPromises = files.map((file) =>
      uploadImage(file, bucket, userId)
    );
    const results = await Promise.all(uploadPromises);

    // Check for errors
    const firstError = results.find((r) => r.error);
    if (firstError) {
      return { data: null, error: firstError.error };
    }

    const urls = results.map((r) => r.data!.url);
    return { data: urls, error: null };
  } catch (error) {
    console.error("Multi-upload error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to upload images",
    };
  }
}
