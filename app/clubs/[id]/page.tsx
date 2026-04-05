import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { getClubById, getClubMembersWithProfilesForMembers, getClubMembers } from "@/lib/actions/clubs";
import { ClubManageContent } from "@/components/sections/club-manage-content";
import { ClubMemberContent } from "@/components/sections/club-member-content";
import { ClubChatContent } from "@/components/sections/club-chat-content";

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

  // First check if user is a member of this club
  const membershipResult = await getClubMembers(id);
  if (membershipResult.error || !membershipResult.data) {
    redirect("/profile");
  }

  const isMember = membershipResult.data.some(member => member.user_id === user.id);
  const userRole = membershipResult.data.find(member => member.user_id === user.id)?.role;
  const isOwner = club.owner_id === user.id;
  const isAdmin = userRole === "Admin";
  const canManage = isOwner || isAdmin;

  // If not a member, redirect to profile
  if (!isMember) {
    redirect("/profile");
  }

  // Now get member profiles (any member can view this)
  const membersResult = await getClubMembersWithProfilesForMembers(id);
  const members = membersResult.data || [];

  return (
    <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <FloatingNavbar />

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-6xl">
        {canManage ? (
          // Owner/Admin view: Full management + chat
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
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
            <div className="lg:col-span-1 h-[600px]">
              <ClubChatContent
                clubId={club.id}
                userId={user.id}
                clubOwnerId={club.owner_id}
              />
            </div>
          </div>
        ) : (
          // Member view: Club info + chat
          <ClubMemberContent
            club={{
              id: club.id,
              name: club.name,
              description: club.description,
              image_url: club.image_url,
              city: (club as { city?: string | null }).city || null,
              created_at: club.created_at || new Date().toISOString(),
              owner_id: club.owner_id,
            }}
            members={members}
            currentUserId={user.id}
          />
        )}
      </div>
    </main>
  );
}
