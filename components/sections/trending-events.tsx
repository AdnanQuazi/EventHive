"use client";

import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/lib/actions/events";

interface TrendingEventsProps {
  title?: string;
  subtitle?: string;
  events: Event[];
}

export function TrendingEvents({
  title = "Trending Events",
  subtitle,
  events,
}: TrendingEventsProps) {
  return (
    <section className="relative px-4 py-16 pb-0 wrapper">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            className="text-accent hover:text-accent/90 hover:bg-accent/10 gap-2 rounded-full px-6 transition-all"
          >
            See all events
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              image={event.main_image_url || ""}
              date={format(new Date(event.start_date), "MMM dd, yyyy")}
              time={format(new Date(event.start_date), "h:mm a")}
              organizer="Organizer"
              isFree={true}
              eventType={event.event_type === "online" ? "Online" : "Offline"}
              category={event.category || undefined}
              attendees={event.attendees?.length || 0}
              attendeeAvatars={[]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
