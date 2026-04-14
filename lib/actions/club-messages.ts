"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables, TablesInsert } from "@/lib/types/database";

export type ClubMessage = Tables<"club_messages">;
export type ClubMessageInsert = TablesInsert<"club_messages">;

export type MessageWithUser = ClubMessage & {
  user_profile?: {
    name: string;
    avatar_url: string | null;
  };
};

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Send a message to a club
 */
export async function sendClubMessage(
  clubId: string,
  content: string
): Promise<ActionResult<ClubMessage>> {
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

    // Verify user is a club member
    const { data: membership, error: membershipError } = await supabase
      .from("club_members")
      .select("id")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return { data: null, error: "You are not a member of this club" };
    }

    // Insert message
    const { data, error } = await supabase
      .from("club_messages")
      .insert({
        club_id: clubId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Send message error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/clubs/${clubId}`);
    return { data, error: null };
  } catch (error) {
    console.error("Send message error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

/**
 * Get messages for a club
 */
export async function getClubMessages(
  clubId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<MessageWithUser[]>> {
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

    // Get messages with user data
    const client = await createClient();
    const adminSupabase = createAdminClient();

    // First verify user has access
    const { data: membership } = await client
      .from("club_members")
      .select("id")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return { data: null, error: "You are not a member of this club" };
    }

    // Get messages with user data using admin client
    const { data: messages, error } = await adminSupabase
      .from("club_messages")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Get messages error:", error);
      return { data: null, error: error.message };
    }

    // Get unique user IDs from messages
    const userIds = [...new Set(messages.map(msg => msg.user_id))];

    // Fetch user profiles for all message senders
    const userProfiles = await Promise.all(
      userIds.map(async (userId) => {
        const { data: userData, error: profileError } =
          await adminSupabase.auth.admin.getUserById(userId);

        if (profileError || !userData.user) {
          return {
            userId,
            profile: {
              name: "Unknown User",
              avatar_url: null,
            },
          };
        }

        return {
          userId,
          profile: {
            name: userData.user.user_metadata?.name || userData.user.email || "Unknown User",
            avatar_url: userData.user.user_metadata?.avatar_url || null,
          },
        };
      })
    );

    // Create a map for quick lookup
    const profileMap = new Map(
      userProfiles.map(({ userId, profile }) => [userId, profile])
    );

    // Attach profile data to messages
    const messagesWithProfiles = messages.map(message => ({
      ...message,
      user_profile: profileMap.get(message.user_id),
    }));

    // Reverse to get chronological order (newest at end)
    return { data: messagesWithProfiles.reverse() as MessageWithUser[], error: null };
  } catch (error) {
    console.error("Get messages error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch messages",
    };
  }
}

/**
 * Delete a message (only by sender or club owner)
 */
export async function deleteClubMessage(
  messageId: string,
  clubId: string
): Promise<ActionResult<null>> {
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

    // Get message
    const { data: message, error: messageError } = await supabase
      .from("club_messages")
      .select("user_id")
      .eq("id", messageId)
      .eq("club_id", clubId)
      .single();

    if (messageError || !message) {
      return { data: null, error: "Message not found" };
    }

    // Check if user is owner of message or club owner
    let canDelete = false;
    if (message.user_id === user.id) {
      canDelete = true;
    } else {
      // Check if user is club owner
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .select("owner_id")
        .eq("id", clubId)
        .single();

      if (club && club.owner_id === user.id) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return {
        data: null,
        error: "You don't have permission to delete this message",
      };
    }

    // Delete message
    const { error } = await supabase
      .from("club_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Delete message error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/clubs/${clubId}`);
    return { data: null, error: null };
  } catch (error) {
    console.error("Delete message error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

/**
 * Edit a club message
 */
export async function editClubMessage(
  messageId: string,
  clubId: string,
  newContent: string
): Promise<ActionResult<ClubMessage>> {
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

    // Get message
    const { data: message, error: messageError } = await supabase
      .from("club_messages")
      .select("user_id")
      .eq("id", messageId)
      .eq("club_id", clubId)
      .single();

    if (messageError || !message) {
      return { data: null, error: "Message not found" };
    }

    // Check if user is owner of message
    if (message.user_id !== user.id) {
      return {
        data: null,
        error: "You can only edit your own messages",
      };
    }

    // Update message
    const { data, error } = await supabase
      .from("club_messages")
      .update({
        content: newContent.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .select()
      .single();

    if (error) {
      console.error("Edit message error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/clubs/${clubId}`);
    return { data, error: null };
  } catch (error) {
    console.error("Edit message error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to edit message",
    };
  }
}
