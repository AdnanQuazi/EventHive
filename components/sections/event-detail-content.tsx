"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  MapPin,
  Users,
  Share2,
  Bookmark,
  Star,
  Globe,
  Video,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { registerForEvent, unregisterFromEvent } from "@/lib/actions/events";
import type { Event } from "@/lib/actions/events";
import type { Tables } from "@/lib/types/database";

type Club = Tables<"clubs">;

interface EventDetailContentProps {
  event: Event;
  club: Club | null;
  ownerName: string;
  ownerAvatar: string | null;
  currentUserId: string;
  isHost: boolean;
  canEdit: boolean;
  isRegistered: boolean;
  attendeeDetails: Record<string, { name: string; avatar: string | null }>;
}

export function EventDetailContent({
  event,
  club,
  ownerName,
  ownerAvatar,
  currentUserId,
  isHost: initialIsHost,
  canEdit,
  isRegistered: initialIsRegistered,
  attendeeDetails,
}: EventDetailContentProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const attendeeCount = event.attendees?.length || 0;

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      if (isRegistered) {
        const result = await unregisterFromEvent(event.id);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Unregistered successfully");
          setIsRegistered(false);
          router.refresh();
        }
      } else {
        const result = await registerForEvent(event.id);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Registered successfully!");
          setIsRegistered(true);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
        {/* Event Title */}
        <div className="mb-15">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {event.title}
            </h1>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full shrink-0"
                onClick={() => router.push(`/events/${event.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
            )}
          </div>

          {/* Category Badge */}
          {event.category && (
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium bg-accent/20 text-accent border-0">
              {event.category}
            </Badge>
          )}

          {/* Host Info */}
          <div className="flex items-center gap-3 mb-15">
            <Avatar className="h-10 w-10">
              {ownerAvatar && <AvatarImage src={ownerAvatar} alt={ownerName} />}
              <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                {ownerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base">
                Hosted by <span className="font-semibold">{ownerName}</span>
              </p>
            </div>
          </div>

          {/* Club Info */}
          {club && (
            <Card className="bg-transparent rounded-2xl cursor-pointer max-w-lg shadow-none border-0 p-0">
              <div className="flex items-center gap-4">
                {club.image_url ? (
                  <div className="relative w-25 h-15 rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={club.image_url}
                      alt={club.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="h-10 w-10 text-accent-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-md truncate">{club.name}</p>
                    <ChevronRight className="h-5 w-5 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-base">
                      {club.rating?.toFixed(1) || '0.0'}
                    </span>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          club.rating && i < Math.floor(club.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : club.rating && i < club.rating
                            ? "fill-yellow-400/50 text-yellow-400/50"
                            : "fill-gray-400 text-gray-400"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground">
                      {attendeeCount} reviews
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Details Section */}
        <Card className="border-0 rounded-3xl p-0 bg-transparent shadow-none gap-0 mb-10">
          <h2 className="text-2xl font-bold mb-4">Details</h2>
          <div className="prose prose-invert max-w-none">
            <p className=" whitespace-pre-wrap ">
              {showFullDescription
                ? event.description
                : event.description?.slice(0, 500)}
            </p>
            {event.description && event.description.length > 500 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-accent hover:underline mt-2 font-medium cursor-pointer"
              >
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        </Card>

        {/* Attendees Section */}
        <Card className="bg-transparent backdrop-blur-xl border-0 rounded-3xl p-0 shadow-none gap-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Attendees
              <Badge variant="secondary" className="text-base rounded-full px-3 py-1">
                {attendeeCount}
              </Badge>
            </h2>
            <Button variant="link" className="text-purple-500 hover:text-purple-400" onClick={() => {}}>
              See all
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Show first 3 attendees */}
            {event.attendees?.slice(0, 3).map((attendeeId, index) => {
              const isHost = index === 0 && initialIsHost;
              const userDetails = attendeeDetails[attendeeId];
              const attendeeName = userDetails?.name || `User ${attendeeId.slice(0, 4)}`;
              const attendeeAvatar = userDetails?.avatar;
              const attendeeRole = isHost ? "Co-organizer" : "Member";
              
              return (
                <Card key={attendeeId} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-35 gap-0 min-h-40">
                  <div className="relative mb-3">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      {attendeeAvatar ? (
                        <img src={attendeeAvatar} alt={attendeeName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                        {attendeeName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isHost && (
                      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0 bg-blue-500 hover:bg-blue-500 border-0">
                        Host
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-center truncate w-full mt-1">{attendeeName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{attendeeRole}</p>
                </Card>
              );
            })}

            {/* +X more card */}
            {attendeeCount > 3 && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-35">
                <div className="relative h-16 w-16 mb-3 flex items-center justify-center">
                  {/* Stacked avatar circles */}
                  <div className="absolute top-0 left-1">
                    <div className="h-10 w-10 rounded-full bg-yellow-400 opacity-80" />
                  </div>
                  <div className="absolute top-0 right-1">
                    <div className="h-10 w-10 rounded-full bg-orange-300 opacity-80" />
                  </div>
                  <div className="absolute bottom-0 left-2">
                    <div className="h-10 w-10 rounded-full bg-orange-400 opacity-80" />
                  </div>
                  <div className="absolute bottom-0 right-2 z-10">
                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center border-2 border-background">
                      <span className="text-white text-xs font-bold">+{attendeeCount - 3}</span>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-sm mt-1">+{attendeeCount - 3} more</p>
              </Card>
            )}
          </div>
        </Card>

        {/* Gallery */}
        <Card className="bg-transparent backdrop-blur-xl border-0 rounded-3xl shadow-none gap-0">
          <h3 className="font-semibold text-2xl mb-4">Photos</h3>
          <div className="relative group">
            {/* Photos Slider */}
            <div 
              id="photos-slider"
              className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 scroll-smooth"
            >
              {event.photos && event.photos.length > 0 ? (
                event.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative shrink-0 w-48 h-48 rounded-xl overflow-hidden bg-white/5 snap-center"
                  >
                    <Image
                      src={photo}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))
              ) : (
                // Placeholder when no photos
                [0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="relative shrink-0 w-48 h-48 rounded-xl overflow-hidden bg-white/5 snap-center"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Navigation Arrows */}
            {event.photos && event.photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const slider = document.getElementById('photos-slider');
                    if (slider) slider.scrollLeft -= 200;
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const slider = document.getElementById('photos-slider');
                    if (slider) slider.scrollLeft += 200;
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Sidebar - Right Side */}
      <div className="space-y-6">
        {/* Event Image */}
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl overflow-hidden p-2">
          <div className="relative w-full h-50 p-0  rounded-3xl">
            <Image
              src={event.main_image_url}
              alt={event.title}
              fill
              className="object-cover  rounded-3xl"
              unoptimized
            />
          </div>
        </Card>

        {/* Event Info Card */}
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl p-5 space-y-4">
          {/* Event Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {event.event_type === "online" ? (
                <Video className="h-5 w-5 text-accent shrink-0" />
              ) : (
                <MapPin className="h-5 w-5 text-accent shrink-0" />
              )}
              <p className="font-medium">
                {event.event_type === "online" ? "Online event" : "Offline event"}
              </p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>

          {/* Date & Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Calendar className="h-5 w-5 mt-0.5 text-accent shrink-0" />
              <div className="flex-1">
                <p className="font-medium">
                  {format(new Date(event.start_date), "EEEE, MMM d")} ·{" "}
                  {format(new Date(event.start_date), "h:mm a")} to{" "}
                  {format(new Date(event.end_date), "h:mm a")}
                </p>
              </div>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
          </div>

          {/* Location - Only for offline events */}
          {event.event_type === "offline" && (
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    {event.venue || "Venue"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.landmark && `${event.landmark} · `}{event.city || ""}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2 mt-0.5" />
            </div>
          )}

          {/* Online Link Info */}
          {event.event_type === "online" && (
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Video className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Online event</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Link visible for attendees
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>

      {/* Sticky Bottom Action Bar - Pill Shaped */}
      <div className="sticky bottom-6 z-50 w-full mt-8 mb-10 flex justify-center px-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/20 rounded-full shadow-2xl max-w-5xl w-full">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            {/* Left: Event Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start_date), "EEE, MMM d · h:mm a")} IST
              </p>
              <p className="font-bold text-lg truncate">{event.title}</p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Free
              </Badge>
              
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <Bookmark className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleRegister}
                disabled={isLoading || initialIsHost}
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 font-semibold"
              >
                {initialIsHost
                  ? "You're the host"
                  : isRegistered
                  ? "Registered"
                  : "Attend"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
