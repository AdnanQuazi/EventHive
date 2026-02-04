"use client";

import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock data - replace with real data from your API
const trendingEvents = [
  {
    id: "1",
    title: "Bitcoin Kernel Club",
    image: "/temp.jpg",
    date: "Thu, Jan 29",
    time: "7:00 PM IST",
    organizer: "Bitshala",
    isFree: true,
    eventType: "Online" as const,
    attendees: 4,
    attendeeAvatars: ["/avatar1.jpg", "/avatar2.jpg"],
  },
  {
    id: "2",
    title: "Let Us Connect: Online Space for Sharing and Understanding...",
    image: "/temp.jpg",
    date: "Thu, Jan 29",
    time: "7:00 PM IST",
    organizer: "Social Anxiety Support Group",
    isFree: true,
    eventType: "Online" as const,
    attendees: 23,
    attendeeAvatars: ["/avatar1.jpg", "/avatar2.jpg", "/avatar3.jpg"],
  },
  {
    id: "3",
    title: "AWS Certified Machine Learning Engineer Associate (MLA-C01) ...",
    image: "/temp.jpg",
    date: "Thu, Jan 29",
    time: "8:00 PM IST",
    organizer: "DataOps Labs India",
    isFree: true,
    eventType: "Online" as const,
    attendees: 39,
    attendeeAvatars: ["/avatar1.jpg", "/avatar2.jpg", "/avatar3.jpg"],
  },
  {
    id: "4",
    title: "The Engineered Excellence",
    image: "/temp.jpg",
    date: "Thu, Jan 29",
    time: "8:00 PM IST",
    organizer: "Excellence Engineered - Hyderabad Me...",
    isFree: true,
    eventType: "Online" as const,
    attendees: 11,
    attendeeAvatars: ["/avatar1.jpg", "/avatar2.jpg", "/avatar3.jpg"],
  },
];

interface TrendingEventsProps {
  title?: string;
  subtitle?: string;
}

export function TrendingEvents({
  title = "Trending Events",
  subtitle,
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
          {trendingEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}
