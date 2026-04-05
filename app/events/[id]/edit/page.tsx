import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { EventEditForm } from "@/components/forms/event-edit-form";
import { getEventById } from "@/lib/actions/events";

interface EventEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventEditPage({ params }: EventEditPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const eventResult = await getEventById(id);
  if (eventResult.error || !eventResult.data) {
    notFound();
  }

  const event = eventResult.data;

  let canEdit = event.owner_id === user.id;

  if (!canEdit && event.club_id) {
    const { data: membership } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", event.club_id)
      .eq("user_id", user.id)
      .single();

    if (membership && (membership.role === "Owner" || membership.role === "Admin")) {
      canEdit = true;
    }
  }

  if (!canEdit) {
    redirect(`/events/${id}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <FloatingNavbar />

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
          <p className="text-muted-foreground">Update event details and save changes.</p>
        </div>
        <EventEditForm
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            event_type: event.event_type,
            category: event.category,
            city: event.city,
            venue: event.venue,
            landmark: event.landmark,
            start_date: event.start_date,
            end_date: event.end_date,
            main_image_url: event.main_image_url,
            photos: event.photos,
          }}
        />
      </div>
    </main>
  );
}
