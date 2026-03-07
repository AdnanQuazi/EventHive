import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "@/components/sections/profile-content";
import { getUserEvents } from "@/lib/actions/events";
import { getUserClubs } from "@/lib/actions/clubs";
import { getMyRegistrations } from "@/lib/actions/registrations";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch user's events and clubs
  const [eventsResult, clubsResult, registrationsResult] = await Promise.all([
    getUserEvents(),
    getUserClubs(),
    getMyRegistrations(),
  ]);

  const events = eventsResult.data || [];
  const clubs = clubsResult.data || [];
  const registrations = registrationsResult.success ? registrationsResult.registrations || [] : [];

  return <ProfileContent user={user} events={events} clubs={clubs} registrations={registrations} />;
}

