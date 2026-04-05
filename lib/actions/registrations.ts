"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { sendRegistrationEmail } from "@/lib/services/email";

/**
 * Generate a unique registration token
 */
function generateRegistrationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create a new event registration with a unique token
 */
export async function createRegistration(eventId: string, userId: string) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  
  // Check if user is already registered
  const { data: existingRegistration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (existingRegistration) {
    return { success: true, registration: existingRegistration };
  }

  // Create new registration with unique token
  const registrationToken = generateRegistrationToken();
  
  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      user_id: userId,
      registration_token: registrationToken,
      checked_in: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating registration:", error);
    return { success: false, error: error.message };
  }

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, start_date, venue, city")
    .eq("id", eventId)
    .single();

  // Fetch user details
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

  // Send registration email if both event and user data are available
  if (event && userData?.user?.email && !eventError && !userError) {
    const attendeeName = userData.user.user_metadata?.name || "Guest";
    const attendeeEmail = userData.user.email;
    const eventVenue = event.city ? `${event.venue}, ${event.city}` : event.venue;

    const emailResult = await sendRegistrationEmail({
      attendeeEmail,
      attendeeName,
      eventTitle: event.title,
      eventDate: event.start_date,
      eventVenue,
      registrationToken,
    });

    if (!emailResult.success) {
      console.warn("Failed to send registration email:", emailResult.error);
      // Don't fail the registration if email fails
    } else {
      console.log("Registration email sent successfully to:", attendeeEmail);
    }
  } else {
    console.warn("Could not send registration email - missing event or user data");
  }

  return { success: true, registration: data };
}

/**
 * Get all registrations for the current user
 */
export async function getMyRegistrations() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("event_registrations")
    .select(`
      *,
      events (
        id,
        title,
        start_date,
        venue,
        city,
        event_type,
        main_image_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching registrations:", error);
    return { success: false, error: error.message };
  }

  return { success: true, registrations: data };
}

/**
 * Get a registration by its unique token (for check-in verification)
 */
export async function getRegistrationByToken(token: string) {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("event_registrations")
    .select(`
      *,
      events (
        id,
        title,
        start_date,
        venue,
        city,
        event_type,
        owner_id,
        club_id,
        main_image_url
      )
    `)
    .eq("registration_token", token)
    .single();

  if (error) {
    console.error("Error fetching registration by token:", error);
    return { success: false, error: "Invalid registration token" };
  }

  // Get user details for the registration
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
    data.user_id
  );

  if (userError || !userData.user) {
    console.error("Error fetching user details:", userError);
    return { success: false, error: "Unable to fetch user details" };
  }

  return {
    success: true,
    registration: {
      ...data,
      user_name: userData.user.user_metadata?.name || "Unknown User",
      user_email: userData.user.email,
      user_avatar: userData.user.user_metadata?.avatar_url,
    },
  };
}

/**
 * Mark a registration as checked in
 */
export async function markCheckedIn(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // First, get the registration to verify permissions
  const { data: registration, error: fetchError } = await supabase
    .from("event_registrations")
    .select(`
      *,
      events (
        id,
        owner_id,
        clubs (
          id,
          club_members!inner (
            user_id,
            role
          )
        )
      )
    `)
    .eq("registration_token", token)
    .single();

  if (fetchError || !registration) {
    return { success: false, error: "Invalid registration token" };
  }

  // Check if user is the event owner or a club admin
  const event = registration.events as any;
  const isEventOwner = event.owner_id === user.id;
  const isClubAdmin = event.clubs?.club_members?.some(
    (member: any) => member.user_id === user.id && member.role === "admin"
  );

  if (!isEventOwner && !isClubAdmin) {
    return { success: false, error: "You don't have permission to check in attendees" };
  }

  // Mark as checked in
  const { data, error } = await supabase
    .from("event_registrations")
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
    })
    .eq("registration_token", token)
    .select()
    .single();

  if (error) {
    console.error("Error marking checked in:", error);
    return { success: false, error: error.message };
  }

  return { success: true, registration: data };
}

/**
 * Get all registrations for an event (for event organizers)
 */
export async function getEventRegistrations(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify user owns the event or is a club admin
  const { data: event } = await supabase
    .from("events")
    .select(`
      id,
      owner_id,
      club_id,
      clubs (
        id,
        club_members!inner (
          user_id,
          role
        )
      )
    `)
    .eq("id", eventId)
    .single();

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  const isEventOwner = event.owner_id === user.id;
  const isClubAdmin = (event.clubs as any)?.club_members?.some(
    (member: any) => member.user_id === user.id && member.role === "admin"
  );

  if (!isEventOwner && !isClubAdmin) {
    return { success: false, error: "You don't have permission to view registrations" };
  }

  const { data: registrations, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching event registrations:", error);
    return { success: false, error: error.message };
  }

  // Get user details for all registrations
  const supabaseAdmin = createAdminClient();
  const userIds = registrations.map((r) => r.user_id);
  const userDetailsPromises = userIds.map((userId) =>
    supabaseAdmin.auth.admin.getUserById(userId)
  );

  const userDetailsResults = await Promise.all(userDetailsPromises);
  const userDetailsMap: Record<string, any> = {};

  userDetailsResults.forEach((result, index) => {
    if (result.data?.user) {
      userDetailsMap[userIds[index]] = {
        name: result.data.user.user_metadata?.name || "Unknown User",
        email: result.data.user.email,
        avatar_url: result.data.user.user_metadata?.avatar_url,
      };
    }
  });

  const registrationsWithUserDetails = registrations.map((reg) => ({
    ...reg,
    user_details: userDetailsMap[reg.user_id] || {
      name: "Unknown User",
      email: "",
      avatar_url: "",
    },
  }));

  return { success: true, registrations: registrationsWithUserDetails };
}
