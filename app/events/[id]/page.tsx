import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById, getUserDetailsByIds } from "@/lib/actions/events";
import { EventDetailContent } from "@/components/sections/event-detail-content";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { Footer } from "@/components/sections/footer";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch event details
  const result = await getEventById(id);

  if (result.error || !result.data) {
    notFound();
  }

  const event = result.data;

  // Fetch club details if event belongs to a club
  let club = null;
  if (event.club_id) {
    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", event.club_id)
      .single();
    club = clubData;
  }

  // Fetch attendee details
  const attendeeIds = event.attendees || [];
  const attendeeDetailsResult = await getUserDetailsByIds(attendeeIds);
  const attendeeDetails = attendeeDetailsResult.data || {};

  // Get owner details from attendee details
  let ownerName = "Event Organizer";
  let ownerAvatar = null;
  if (attendeeDetails[event.owner_id]) {
    ownerName = attendeeDetails[event.owner_id].name;
    ownerAvatar = attendeeDetails[event.owner_id].avatar;
  } else if (event.owner_id === user.id) {
    ownerName = user.user_metadata?.name || user.email?.split('@')[0] || "You";
    ownerAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  }

  // Check if user is the host
  const isHost = event.owner_id === user.id;

  // Check if user is already registered
  const isRegistered = event.attendees?.includes(user.id) || false;

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen pt-20 pb-12">
        {/* Background ambient elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[128px]" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[128px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-7xl">
          <EventDetailContent
            event={event}
            club={club}
            ownerName={ownerName}
            ownerAvatar={ownerAvatar}
            currentUserId={user.id}
            isHost={isHost}
            isRegistered={isRegistered}
            attendeeDetails={attendeeDetails}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
