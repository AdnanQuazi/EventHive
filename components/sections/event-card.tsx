"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle, Calendar } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  organizer: string;
  isFree?: boolean;
  price?: string;
  eventType?: "Online" | "Offline";
  category?: string;
  attendees?: number;
  attendeeAvatars?: string[];
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function EventCard({
  id,
  title,
  image,
  date,
  time,
  organizer,
  isFree = false,
  price,
  eventType = "Online",
  category,
  attendees = 0,
  attendeeAvatars = [],
  onDelete,
  isDeleting,
}: EventCardProps) {
  return (
    <Link href={`/events/${id}`}>
      <Card className="p-0 group relative overflow-hidden bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] w-full max-w-[320px] rounded-3xl border-0 shadow-none">
      <CardContent className="p-0">
        {/* Event Image */}
        <div className="relative w-full h-[170px] overflow-hidden rounded-t-3xl group-hover:scale-95 transition-transform duration-300 bg-white/5">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 rounded-3xl"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-16 w-16 text-muted-foreground opacity-30" />
            </div>
          )}
          {/* Free/Price Badge */}
          {(isFree || price) && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 bg-white text-black font-semibold px-3 py-1 hover:bg-white rounded-full"
            >
              {isFree ? "Free" : price}
            </Badge>
          )}
          {/* Category Badge */}
          {category && (
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 bg-accent/90 text-white font-medium px-3 py-1 rounded-full backdrop-blur-sm"
            >
              {category}
            </Badge>
          )}
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-2">
          {/* Event Title */}
          <h3 className="font-bold text-foreground text-[17px] line-clamp-2 leading-tight mb-1">
            {title}
          </h3>

          {/* Date, Time and Event Type */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-0.5">
            <span>{date} · {time}</span>
            <span>·</span>
            <Circle className="w-1.5 h-1.5 fill-current" />
            <span className="font-medium">{eventType}</span>
          </div>

          {/* Organizer */}
          <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5">
            by {organizer}
          </p>

          {/* Attendees */}
          <div className="flex items-center gap-2 pt-1">
            {/* Attendee Avatars */}
            {attendees > 0 && (
              <div className="flex -space-x-2">
                {attendeeAvatars.length > 0 
                  ? attendeeAvatars.slice(0, 3).map((avatar, index) => (
                      <Avatar key={index} className="w-6 h-6 border-2 border-background">
                        <AvatarImage src={avatar} alt={`Attendee ${index + 1}`} />
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                          {String.fromCharCode(65 + index)}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  : Array.from({ length: Math.min(attendees, 3) }).map((_, index) => (
                      <Avatar key={index} className="w-6 h-6 border-2 border-background">
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                          {String.fromCharCode(65 + index)}
                        </AvatarFallback>
                      </Avatar>
                    ))
                }
              </div>
            )}
            {/* Attendee Count */}
            {attendees > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                {attendees} attendee{attendees !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-4 w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
