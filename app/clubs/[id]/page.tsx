import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { getClubById, getClubMembersWithProfiles } from "@/lib/actions/clubs";
import { ClubManageContent } from "@/components/sections/club-manage-content";

interface ClubManagePageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubManagePage({ params }: ClubManagePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const clubResult = await getClubById(id);
  if (clubResult.error || !clubResult.data) {
    redirect("/profile");
  }

  const club = clubResult.data;
  if (club.owner_id !== user.id) {
    redirect("/profile");
  }

  const membersResult = await getClubMembersWithProfiles(id);
  const members = membersResult.data || [];

  return (
    <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <FloatingNavbar />

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-6xl">
        <ClubManageContent
          club={{
            id: club.id,
            name: club.name,
            description: club.description,
            image_url: club.image_url,
            city: (club as { city?: string | null }).city || null,
            created_at: club.created_at || new Date().toISOString(),
          }}
          initialMembers={members}
        />
      </div>
    </main>
  );
}
