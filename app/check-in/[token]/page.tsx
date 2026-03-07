import { getRegistrationByToken, markCheckedIn } from "@/lib/actions/registrations";
import { CheckInContent } from "@/components/sections/check-in-content";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface CheckInPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { token } = await params;

  // Get registration details
  const result = await getRegistrationByToken(token);

  if (!result.success || !result.registration) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-red-600">Invalid Registration</h1>
          <p className="text-muted-foreground">
            This QR code is not valid. Please check with the event organizer.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated, redirect to sign in
  if (!user) {
    redirect(`/sign-in?redirect=/check-in/${token}`);
  }

  // Check if user has permission to check in (event owner or club admin/manager)
  let hasPermission = false;
  const event = result.registration.events as any;
  
  if (event.owner_id === user.id) {
    hasPermission = true;
  } else if (event.club_id) {
    // Check if user is admin or manager of the club
    const { data: membership } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", event.club_id)
      .eq("user_id", user.id)
      .single();
    
    if (membership && (membership.role === "admin" || membership.role === "manager")) {
      hasPermission = true;
    }
  }

  return (
    <CheckInContent 
      registration={result.registration} 
      token={token} 
      currentUser={user}
      hasPermission={hasPermission}
    />
  );
}
