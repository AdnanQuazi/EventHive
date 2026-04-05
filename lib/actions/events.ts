"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";
import { createRegistration } from "@/lib/actions/registrations";

export type Event = Tables<"events">;
export type EventInsert = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;
export type EventType = "online" | "offline";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Create a new event
 */
export async function createEvent(
  eventData: Omit<EventInsert, "owner_id">
): Promise<ActionResult<Event>> {
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

    // If club_id is provided, verify user has permission to create events for that club
    if (eventData.club_id) {
      const hasPermission = await checkClubPermission(
        eventData.club_id,
        user.id
      );
      if (!hasPermission) {
        return {
          data: null,
          error: "You don't have permission to create events for this club",
        };
      }
    }

    // Insert event
    const { data, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        owner_id: user.id,
        attendees: [user.id], // Add creator as default attendee
      })
      .select()
      .single();

    if (error) {
      console.error("Create event error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/events");
    if (eventData.club_id) {
      revalidatePath(`/clubs/${eventData.club_id}`);
    }

    return { data, error: null };
  } catch (error) {
    console.error("Create event error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(
  eventId: string,
  updates: EventUpdate
): Promise<ActionResult<Event>> {
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

    // Get event to check permissions
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("owner_id, club_id")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Get event error:", eventError);
      return { data: null, error: "Event not found" };
    }

    // Check if user is owner or has club permission
    let hasPermission = event.owner_id === user.id;

    if (!hasPermission && event.club_id) {
      hasPermission = await checkClubPermission(event.club_id, user.id, [
        "Owner",
        "Admin",
      ]);
    }

    if (!hasPermission) {
      return {
        data: null,
        error: "You don't have permission to update this event",
      };
    }

    // Update event
    const { data, error } = await supabase
      .from("events")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Update event error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    if (event.club_id) {
      revalidatePath(`/clubs/${event.club_id}`);
    }

    return { data, error: null };
  } catch (error) {
    console.error("Update event error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update event",
    };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(
  eventId: string
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

    // Check if user is admin (has full delete permissions)
    const isAdmin = await checkAdminPermission(user.email);

    if (!isAdmin) {
      // Get event to check permissions for non-admin users
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("owner_id, club_id")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Get event error:", eventError);
        return { data: null, error: "Event not found" };
      }

      // Check if user is owner or has club admin/owner permission
      let hasPermission = event.owner_id === user.id;

      if (!hasPermission && event.club_id) {
        hasPermission = await checkClubPermission(event.club_id, user.id, [
          "Owner",
          "Admin",
        ]);
      }

      if (!hasPermission) {
        return {
          data: null,
          error: "You don't have permission to delete this event",
        };
      }
    }

    // Delete event (admin or authorized user)
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Delete event error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/events");
    // Note: We don't have event.club_id here for revalidation, but that's okay

    return { data: null, error: null };
  } catch (error) {
    console.error("Delete event error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete event",
    };
  }
}

/**
 * Get an event by ID
 */
export async function getEventById(
  eventId: string
): Promise<ActionResult<Event>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Get event error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Get event error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch event",
    };
  }
}

/**
 * Get all events for the current user
 */
export async function getUserEvents(): Promise<ActionResult<Event[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Fetch events where user is owner OR attendee
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(`owner_id.eq.${user.id},attendees.cs.{${user.id}}`)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Get user events error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Get user events error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch events",
    };
  }
}

/**
 * Get all events for a specific club
 */
export async function getClubEvents(
  clubId: string
): Promise<ActionResult<Event[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("club_id", clubId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Get club events error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Get club events error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch club events",
    };
  }
}

/**
 * Get all public events (with pagination and filters)
 */
export async function getPublicEvents(options?: {
  limit?: number;
  offset?: number;
  city?: string;
  eventType?: EventType;
  startDateFrom?: string;
  startDateTo?: string;
}): Promise<ActionResult<Event[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });

    // Apply filters
    if (options?.city) {
      query = query.eq("city", options.city);
    }

    if (options?.eventType) {
      query = query.eq("event_type", options.eventType);
    }

    if (options?.startDateFrom) {
      query = query.gte("start_date", options.startDateFrom);
    }

    if (options?.startDateTo) {
      query = query.lte("start_date", options.startDateTo);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get public events error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Get public events error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch public events",
    };
  }
}

/**
 * Add current user to event attendees
 */
export async function registerForEvent(
  eventId: string
): Promise<ActionResult<Event>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get current event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("attendees")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Get event error:", eventError);
      return { data: null, error: "Event not found" };
    }

    // Check if already registered
    const currentAttendees = event.attendees || [];
    if (currentAttendees.includes(user.id)) {
      return { data: null, error: "Already registered for this event" };
    }

    // Add user to attendees
    const { data, error } = await supabase
      .from("events")
      .update({
        attendees: [...currentAttendees, user.id],
      })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Register for event error:", error);
      return { data: null, error: error.message };
    }

    // Create registration record with unique token for QR code
    const registrationResult = await createRegistration(eventId, user.id);
    if (!registrationResult.success) {
      console.error("Failed to create registration record:", registrationResult.error);
      // Don't fail the whole operation, just log the error
    }

    revalidatePath(`/events/${eventId}`);

    return { data, error: null };
  } catch (error) {
    console.error("Register for event error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to register for event",
    };
  }
}

/**
 * Remove current user from event attendees
 */
export async function unregisterFromEvent(
  eventId: string
): Promise<ActionResult<Event>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get current event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("attendees")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Get event error:", eventError);
      return { data: null, error: "Event not found" };
    }

    // Remove user from attendees
    const currentAttendees = event.attendees || [];
    const updatedAttendees = currentAttendees.filter((id: string) => id !== user.id);

    const { data, error } = await supabase
      .from("events")
      .update({
        attendees: updatedAttendees,
      })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Unregister from event error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/events/${eventId}`);

    return { data, error: null };
  } catch (error) {
    console.error("Unregister from event error:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to unregister from event",
    };
  }
}

/**
 * Get user details by user IDs
 */
export async function getUserDetailsByIds(
  userIds: string[]
): Promise<ActionResult<Record<string, { name: string; avatar: string | null }>>> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabaseAdmin = createAdminClient();
    const userDetails: Record<string, { name: string; avatar: string | null }> = {};

    // Fetch details for each user
    for (const userId of userIds) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (user) {
          userDetails[userId] = {
            name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          };
        } else {
          userDetails[userId] = {
            name: "User",
            avatar: null,
          };
        }
      } catch (error) {
        // If admin call fails, use fallback
        console.error(`Failed to fetch user ${userId}:`, error);
        userDetails[userId] = {
          name: "User",
          avatar: null,
        };
      }
    }

    return { data: userDetails, error: null };
  } catch (error) {
    console.error("Get user details error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch user details",
    };
  }
}

/**
 * Helper function to check if user has permission for a club
 */
async function checkClubPermission(
  clubId: string,
  userId: string,
  allowedRoles: ("Owner" | "Admin" | "Manager")[] = [
    "Owner",
    "Admin",
    "Manager",
  ]
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Check if user is owner
    const { data: club } = await supabase
      .from("clubs")
      .select("owner_id")
      .eq("id", clubId)
      .single();

    if (club?.owner_id === userId) {
      return true;
    }

    // Check if user has required role
    const { data: member } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("user_id", userId)
      .single();

    return member ? allowedRoles.includes(member.role) : false;
  } catch (error) {
    console.error("Check club permission error:", error);
    return false;
  }
}

/**
 * Helper function to check if user is an admin (has full website permissions)
 */
async function checkAdminPermission(userEmail: string | undefined): Promise<boolean> {
  // Admin email - can delete any event
  const ADMIN_EMAIL = "atharvapawar80078@gmail.com";
  return userEmail === ADMIN_EMAIL;
}

/**
 * Search events by title, category, and location
 */
export async function searchEvents(params: {
  query?: string;
  category?: string;
  city?: string;
  eventType?: "online" | "offline";
  limit?: number;
}): Promise<ActionResult<Event[]>> {
  try {
    const supabase = await createClient();
    const { query, category, city, eventType, limit = 50 } = params;

    let queryBuilder = supabase
      .from("events")
      .select("*")
      .gte("start_date", new Date().toISOString()) // Only upcoming events
      .order("start_date", { ascending: true })
      .limit(limit);

    // Search by title (case-insensitive)
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Filter by category
    if (category && category !== "all") {
      queryBuilder = queryBuilder.eq("category", category);
    }

    // Filter by city
    if (city && city !== "all") {
      queryBuilder = queryBuilder.eq("city", city);
    }

    // Filter by event type
    if (eventType) {
      queryBuilder = queryBuilder.eq("event_type", eventType);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Search events error:", error);
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Search events error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to search events",
    };
  }
}

/**
 * Get all unique cities from events (for filter dropdown)
 */
export async function getEventCities(): Promise<ActionResult<string[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("city")
      .not("city", "is", null)
      .gte("start_date", new Date().toISOString());

    if (error) {
      console.error("Get cities error:", error);
      return { data: null, error: error.message };
    }

    // Extract unique cities
    const cities = Array.from(
      new Set(data.map((event) => event.city).filter(Boolean))
    ) as string[];

    return { data: cities.sort(), error: null };
  } catch (error) {
    console.error("Get cities error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch cities",
    };
  }
}

