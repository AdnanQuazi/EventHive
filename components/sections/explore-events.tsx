"use client";

import { useState } from "react";
import { EventCard } from "@/components/sections/event-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Tag, MonitorPlay, Calendar } from "lucide-react";
import type { Event } from "@/lib/actions/events";
import { format } from "date-fns";

const CATEGORIES = [
  "All Categories",
  "Technology",
  "Sports",
  "Music",
  "Arts & Culture",
  "Business",
  "Education",
  "Food & Drink",
  "Health & Wellness",
  "Social",
  "Gaming",
  "Networking",
  "Workshop",
  "Conference",
  "Entertainment",
  "Community",
  "Other",
];

interface ExploreEventsProps {
  initialEvents: Event[];
  availableCities: string[];
  initialCategory?: string;
  initialCity?: string;
  initialType?: "online" | "offline";
}

export function ExploreEvents({
  initialEvents,
  availableCities,
  initialCategory,
  initialCity,
  initialType,
}: ExploreEventsProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [selectedCity, setSelectedCity] = useState(initialCity || "all");
  const [selectedType, setSelectedType] = useState<string>(initialType || "all");
  const [sortBy, setSortBy] = useState<"latest" | "earliest" | "popular">("latest");

  // Filter events locally
  let filteredEvents = initialEvents.filter((event) => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesCity = selectedCity === "all" || event.city === selectedCity;
    const matchesType = selectedType === "all" || event.event_type === selectedType;
    
    return matchesCategory && matchesCity && matchesType;
  });

  // Sort events
  filteredEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    } else if (sortBy === "earliest") {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    } else if (sortBy === "popular") {
      return (b.attendees?.length || 0) - (a.attendees?.length || 0);
    }
    return 0;
  });

  const hasActiveFilters = selectedCategory !== "all" || selectedCity !== "all" || selectedType !== "all";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("all");
    setSelectedType("all");
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          {initialCategory ? `${initialCategory} Events` : "Explore Events"}
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover all upcoming and past events. Found {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters & Sort Section */}
      <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Top Row: Sort */}
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-2">Sort by</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-2xl">
                    <SelectItem value="latest">Latest First (Newest)</SelectItem>
                    <SelectItem value="earliest">Earliest First (Completed)</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row: Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-2xl">
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.slice(1).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-2xl">
                    <SelectItem value="all">All Cities</SelectItem>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4" />
                  Event Type
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-2xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
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
      ) : (
        <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters to find events you're interested in
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" className="rounded-xl">
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
