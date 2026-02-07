"use client";

import { User } from "@supabase/supabase-js";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventCard } from "@/components/sections/event-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  Users,
  Crown,
  UserCheck,
  Shield,
  ChevronDown,
  Plus,
  Eye,
  Settings,
  Compass,
  MapPin,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfileContentProps {
  user: User;
}

export function ProfileContent({ user }: ProfileContentProps) {
  const [filter, setFilter] = useState<"all" | "organizing" | "participating">("all");
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(true);
  const [isPastOpen, setIsPastOpen] = useState(false);
  const [isOwnedClubsOpen, setIsOwnedClubsOpen] = useState(true);
  const [isMemberClubsOpen, setIsMemberClubsOpen] = useState(true);

  const getUserName = () => {
    return user?.user_metadata?.name || "User";
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  // Placeholder data
  const stats = {
    eventsHosted: 12,
    eventsAttended: 35,
    clubsOwned: 2,
    clubsJoined: 5,
  };

  const upcomingEvents = [
    {
      id: "1",
      title: "Tech Conference 2026",
      image: "/temp.jpg",
      date: "Feb 15, 2026",
      time: "10:00 AM",
      organizer: "Tech Community SF",
      isFree: false,
      price: "$49",
      eventType: "Offline" as const,
      attendees: 234,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg", "/temp.jpg"],
      role: "organizing",
    },
    {
      id: "2",
      title: "Design Workshop: Modern UI/UX Principles",
      image: "/temp.jpg",
      date: "Feb 20, 2026",
      time: "2:00 PM",
      organizer: "Design Masters NYC",
      isFree: true,
      eventType: "Online" as const,
      attendees: 45,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg"],
      role: "participating",
    },
    {
      id: "3",
      title: "React Meetup",
      image: "/temp.jpg",
      date: "Feb 25, 2026",
      time: "6:00 PM",
      organizer: "JavaScript Developers",
      isFree: false,
      price: "$15",
      eventType: "Offline" as const,
      attendees: 89,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg", "/temp.jpg"],
      role: "organizing",
    },
    {
      id: "6",
      title: "AI & Machine Learning Summit",
      image: "/temp.jpg",
      date: "Mar 5, 2026",
      time: "9:00 AM",
      organizer: "AI Enthusiasts",
      isFree: false,
      price: "$99",
      eventType: "Online" as const,
      attendees: 567,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg", "/temp.jpg"],
      role: "participating",
    },
  ];

  const historyEvents = [
    {
      id: "4",
      title: "Web Dev Bootcamp",
      image: "/temp.jpg",
      date: "Jan 10, 2026",
      time: "9:00 AM",
      organizer: "Code Academy",
      isFree: false,
      price: "$199",
      eventType: "Online" as const,
      attendees: 120,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg", "/temp.jpg"],
      role: "participating",
    },
    {
      id: "5",
      title: "Marketing Summit 2025",
      image: "/temp.jpg",
      date: "Dec 15, 2025",
      time: "1:00 PM",
      organizer: "Marketing Pros",
      isFree: true,
      eventType: "Offline" as const,
      attendees: 300,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg", "/temp.jpg"],
      role: "organizing",
    },
    {
      id: "7",
      title: "Startup Pitch Night",
      image: "/temp.jpg",
      date: "Nov 20, 2025",
      time: "7:00 PM",
      organizer: "Startup Founders",
      isFree: false,
      price: "$25",
      eventType: "Offline" as const,
      attendees: 85,
      attendeeAvatars: ["/temp.jpg", "/temp.jpg"],
      role: "organizing",
    },
  ];

  const ownedClubs = [
    {
      id: "1",
      name: "JavaScript Developers",
      description: "Welcome to JavaScript Developers! Connect with fellow developers, share knowledge, and build amazing projects together.",
      members: 1234,
      image: "/temp.jpg",
      location: "San Francisco",
      rating: 4.8,
      upcomingEvents: 3,
    },
    {
      id: "2",
      name: "Design Masters",
      description: "A community for designers to collaborate, learn modern design principles, and create stunning user experiences.",
      members: 890,
      image: "/temp.jpg",
      location: "New York",
      rating: 4.6,
      upcomingEvents: 1,
    },
  ];

  const joinedClubs = [
    {
      id: "3",
      name: "Startup Founders",
      description: "Join a network of ambitious entrepreneurs building the next generation of innovative startups and businesses.",
      members: 567,
      image: "/temp.jpg",
      location: "Austin",
      rating: 4.9,
      upcomingEvents: 2,
    },
    {
      id: "4",
      name: "Product Managers",
      description: "Connect with product leaders, share best practices, and master the art of building products people love.",
      members: 432,
      image: "/temp.jpg",
      location: "Seattle",
      rating: 4.5,
      upcomingEvents: 0,
    },
    {
      id: "5",
      name: "AI Enthusiasts",
      description: "Explore the future of artificial intelligence and machine learning with a passionate community of innovators.",
      members: 789,
      image: "/temp.jpg",
      location: "Los Angeles",
      rating: 4.7,
      upcomingEvents: 5,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <FloatingNavbar />

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-7xl">
        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-auto">
          
          {/* LEFT SIDEBAR - Profile Card - Spans 3 columns */}
          <Card className="lg:col-span-3 bg-white/5 backdrop-blur-xl border-0 rounded-3xl overflow-hidden lg:sticky lg:top-32 h-fit">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Avatar */}
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage src={getUserAvatar()} alt={getUserName()} />
                  <AvatarFallback className="text-4xl bg-linear-to-br from-purple-500 to-blue-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Email */}
                <div className="w-full space-y-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    {getUserName()}
                  </h1>
                  <p className="text-sm text-muted-foreground break-words">
                    {user.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="w-full space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-yellow-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Events Hosted</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-400">{stats.eventsHosted}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Events Attended</span>
                    </div>
                    <span className="text-xl font-bold text-blue-400">{stats.eventsAttended}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Clubs</span>
                    </div>
                    <span className="text-xl font-bold text-purple-400">{stats.clubsOwned + stats.clubsJoined}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT CONTENT AREA - Spans 9 columns */}
          <div className="lg:col-span-9 space-y-6">
            
          {/* MAIN EVENT FEED - Full width */}
          <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              {/* Header with Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="text-2xl font-bold text-foreground">My Events</h3>
                
                {/* Shared Filter */}
                <Select value={filter} onValueChange={(value: "all" | "organizing" | "participating") => setFilter(value)}>
                  <SelectTrigger className="w-[200px] bg-white/5 border-white/10 rounded-full">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Showing:</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl">
                    <SelectItem value="all" className="rounded-lg">All Events</SelectItem>
                    <SelectItem value="organizing" className="rounded-lg">Organizing</SelectItem>
                    <SelectItem value="participating" className="rounded-lg">Participating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* UPCOMING SECTION - Collapsible, Open by Default */}
              <Collapsible open={isUpcomingOpen} onOpenChange={setIsUpcomingOpen} className="mb-6">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all mb-4 group">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Upcoming
                  </h4>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    isUpcomingOpen ? "rotate-180" : ""
                  }`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                  <EventGrid events={upcomingEvents} filter={filter} />
                </CollapsibleContent>
              </Collapsible>

              {/* PAST SECTION - Collapsible, Closed by Default */}
              <Collapsible open={isPastOpen} onOpenChange={setIsPastOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all mb-4 group">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    Past
                  </h4>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    isPastOpen ? "rotate-180" : ""
                  }`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                  <EventGrid events={historyEvents} filter={filter} />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* CLUBS SECTION - Full width */}
          <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-foreground mb-8">My Clubs</h3>

              {/* OWNED CLUBS SECTION - Collapsible, Open by Default */}
              <Collapsible open={isOwnedClubsOpen} onOpenChange={setIsOwnedClubsOpen} className="mb-6">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all mb-4 group">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Owned Clubs
                  </h4>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0 rounded-full text-xs">
                      {ownedClubs.length}
                    </Badge>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      isOwnedClubsOpen ? "rotate-180" : ""
                    }`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                  <ClubGrid clubs={ownedClubs} role="owner" />
                </CollapsibleContent>
              </Collapsible>

              {/* MEMBER OF SECTION - Collapsible, Open by Default */}
              <Collapsible open={isMemberClubsOpen} onOpenChange={setIsMemberClubsOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all mb-4 group">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Member Of
                  </h4>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500/20 text-blue-400 border-0 rounded-full text-xs">
                      {joinedClubs.length}
                    </Badge>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      isMemberClubsOpen ? "rotate-180" : ""
                    }`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
                  <ClubGrid clubs={joinedClubs} role="member" />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          </div>
          {/* End Right Content Area */}

        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </main>
  );
}

// Club Grid Component with Empty State
function ClubGrid({
  clubs,
  role,
}: {
  clubs: any[];
  role: "owner" | "member";
}) {
  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-white/5">
        <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h4 className="text-lg font-semibold text-foreground mb-2">
          {role === "owner" ? "You don't own any clubs yet" : "You haven't joined any clubs yet"}
        </h4>
        <p className="text-sm text-muted-foreground mb-6">
          {role === "owner" 
            ? "Create your first club and build a community" 
            : "Discover and join clubs that match your interests"}
        </p>
        <Button className="bg-accent hover:bg-accent/90 text-white rounded-full">
          {role === "owner" ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create a Club
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 mr-2" />
              Explore Clubs
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clubs.map((club) => (
        <ClubCard key={club.id} club={club} role={role} />
      ))}
    </div>
  );
}

// Club Card Component
function ClubCard({ club, role }: { club: any; role: "owner" | "member" }) {
  return (
    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.01] rounded-3xl border-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Banner Image - Left Side */}
          <div className="relative w-full sm:w-72 h-48 sm:h-auto shrink-0 overflow-hidden sm:rounded-l-3xl">
            <Image
              src={club.image}
              alt={club.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Content - Right Side */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Location and Rating */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              <span>{club.location}</span>
              <span>·</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{club.rating}</span>
            </div>

            {/* Club Name */}
            <h4 className="font-bold text-foreground text-xl mb-3 line-clamp-2">
              {club.name}
            </h4>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {club.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                <Users className="w-4 h-4" />
                <span>{club.members.toLocaleString()} members</span>
              </div>
              {club.upcomingEvents > 0 && (
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Calendar className="w-4 h-4" />
                  <span>{club.upcomingEvents} upcoming</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Event Grid Component with Empty State
function EventGrid({
  events,
  filter,
}: {
  events: any[];
  filter: "all" | "organizing" | "participating";
}) {
  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.role === filter;
  });

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-white/5">
        <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h4 className="text-lg font-semibold text-foreground mb-2">No events found</h4>
        <p className="text-sm text-muted-foreground">
          {filter === "all" 
            ? "No events in this category yet." 
            : `No ${filter} events found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          title={event.title}
          image={event.image}
          date={event.date}
          time={event.time}
          organizer={event.organizer}
          isFree={event.isFree}
          price={event.price}
          eventType={event.eventType}
          attendees={event.attendees}
          attendeeAvatars={event.attendeeAvatars}
        />
      ))}
    </div>
  );
}
