"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Update user profile (name and/or avatar)
 */
export async function updateUserProfile(
  name?: string,
  avatarUrl?: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Prepare metadata update
    const metadata: Record<string, any> = {};
    if (name !== undefined) {
      metadata.name = name.trim();
    }
    if (avatarUrl !== undefined) {
      metadata.avatar_url = avatarUrl;
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        ...metadata,
      },
    });

    if (updateError) {
      console.error("Update profile error:", updateError);
      return { data: null, error: updateError.message };
    }

    revalidatePath("/profile");
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Upload profile picture to Supabase Storage
 */
export async function uploadProfilePicture(file: File): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

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
    const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Delete old profile picture if it exists
    if (user.user_metadata?.avatar_url) {
      const oldPath = user.user_metadata.avatar_url.split("/").pop();
      if (oldPath) {
        try {
          await supabase.storage.from("profile-images").remove([`${user.id}/${oldPath}`]);
        } catch (error) {
          console.warn("Could not delete old profile picture:", error);
        }
      }
    }

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { data: null, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("profile-images")
      .getPublicUrl(uploadData.path);

    return { data: publicUrl.publicUrl, error: null };
  } catch (error) {
    console.error("Upload profile picture error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to upload profile picture",
    };
  }
}
