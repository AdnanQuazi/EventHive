"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import Image from "next/image";
import { useState } from "react";
import { markCheckedIn } from "@/lib/actions/registrations";
import { Calendar, MapPin, CheckCircle2, XCircle, Clock, User, Shield, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { format } from "date-fns";

interface CheckInContentProps {
  registration: {
    id: string;
    user_id: string;
    checked_in: boolean;
    checked_in_at?: string;
    user_name: string;
    user_email?: string;
    user_avatar?: string;
    events: {
      id: string;
      title: string;
      start_date: string;
      venue?: string;
      city?: string;
      event_type?: string;
      main_image_url?: string;
      owner_id: string;
      club_id?: string;
    } | null;
  };
  token: string;
  currentUser: SupabaseUser;
  hasPermission: boolean;
}

export function CheckInContent({ registration, token, currentUser, hasPermission }: CheckInContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (!registration.events) {
    return (
      <>
        <FloatingNavbar />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-red-600">Event Not Found</h1>
            <p className="text-muted-foreground">The event associated with this registration could not be found.</p>
          </div>
        </div>
      </>
    );
  }

  const event = registration.events;
  const eventDate = new Date(event.start_date);

  const handleCheckIn = async () => {
    if (!hasPermission) return;
    
    setIsLoading(true);
    setError(null);

    const result = await markCheckedIn(token);

    if (result.success) {
      setSuccess(true);
      // Refresh page to show updated status
      router.refresh();
    } else {
      setError(result.error || "Failed to check in");
    }

    setIsLoading(false);
  };

  return (
    <>
      <FloatingNavbar />
      
      <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-4xl">
          <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl overflow-hidden shadow-2xl">
            {/* Event Header Image */}
            <div className="relative h-80 w-full overflow-hidden">
              {event.main_image_url ? (
                <Image
                  src={event.main_image_url}
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Event Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {format(eventDate, "EEE, MMM d, yyyy")} · {format(eventDate, "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {event.event_type === "online" 
                        ? "Online Event" 
                        : `${event.venue || "Venue"}${event.city ? `, ${event.city}` : ""}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Attendee Information Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Attendee Details
                  </h3>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-0">
                    Registered
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-white/20">
                    <AvatarImage src={registration.user_avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {registration.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-foreground mb-1">
                      {registration.user_name}
                    </h4>
                    {registration.user_email && (
                      <p className="text-sm text-muted-foreground">
                        {registration.user_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permission Status */}
              {!hasPermission && !registration.checked_in && (
                <div className="bg-yellow-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-yellow-500/20 p-3 shrink-0">
                      <ShieldAlert className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-500 mb-1">
                        No Permission to Check In
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You must be the event organizer or a club admin/manager to check in attendees.
                        Only authorized personnel can mark attendance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Check-in Status */}
              {registration.checked_in ? (
                <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full bg-green-500 p-4 shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-500 mb-2">
                        Already Checked In
                      </h3>
                      {registration.checked_in_at && (
                        <p className="text-sm text-muted-foreground">
                          Checked in on {format(new Date(registration.checked_in_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                      <div className="flex items-center gap-3 text-red-500">
                        <XCircle className="h-6 w-6 shrink-0" />
                        <p className="font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success ? (
                    <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="rounded-full bg-green-500 p-4 shadow-lg shadow-green-500/20">
                          <CheckCircle2 className="h-12 w-12 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-500 mb-2">
                            Check-in Successful!
                          </h3>
                          <p className="text-muted-foreground">
                            {registration.user_name} has been checked in
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Check-in Button */}
                      <Button
                        onClick={handleCheckIn}
                        disabled={isLoading || !hasPermission}
                        size="lg"
                        className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {isLoading ? (
                          <>
                            <Clock className="mr-2 h-6 w-6 animate-spin" />
                            Checking In...
                          </>
                        ) : !hasPermission ? (
                          <>
                            <ShieldAlert className="mr-2 h-6 w-6" />
                            No Permission
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-6 w-6" />
                            Confirm Check-In
                          </>
                        )}
                      </Button>

                      {/* Instructions */}
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">
                              Security Notice
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Please verify the attendee&apos;s identity before confirming check-in. 
                              Only event organizers and club admins/managers can check in attendees.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
