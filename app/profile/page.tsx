import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "@/components/sections/profile-content";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in");
  }

  return <ProfileContent user={user} />;
}
