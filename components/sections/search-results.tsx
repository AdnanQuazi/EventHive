"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Search, X, MapPin, Tag, MonitorPlay } from "lucide-react";
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

interface SearchResultsProps {
  initialEvents: Event[];
  initialQuery: string;
  initialCategory?: string;
  initialCity?: string;
  initialType?: "online" | "offline";
  availableCities: string[];
  initialShowUpcoming?: boolean;
}

export function SearchResults({
  initialEvents,
  initialQuery,
  initialCategory,
  initialCity,
  initialType,
  availableCities,
  initialShowUpcoming = false,
}: SearchResultsProps) {
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [selectedCity, setSelectedCity] = useState(initialCity || "all");
  const [selectedType, setSelectedType] = useState<string>(initialType || "all");
  const [sortBy, setSortBy] = useState<"latest" | "earliest" | "popular">("latest");
  const [showUpcoming, setShowUpcoming] = useState(initialShowUpcoming);

  // Filter events locally for instant feedback
  let filteredEvents = initialEvents.filter((event) => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesCity = selectedCity === "all" || event.city === selectedCity;
    const matchesType = selectedType === "all" || event.event_type === selectedType;
    const matchesUpcoming = !showUpcoming || new Date(event.start_date) >= new Date();
    
    return matchesCategory && matchesCity && matchesType && matchesUpcoming;
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (initialQuery.trim()) params.set("q", initialQuery.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedCity !== "all") params.set("city", selectedCity);
    if (selectedType !== "all") params.set("type", selectedType);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCity("all");
    setSelectedType("all");
    router.push(`/search?q=${initialQuery}`);
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedCity !== "all" || selectedType !== "all";

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 relative z-10 max-w-7xl">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {initialQuery ? `Search results for "${initialQuery}"` : "Explore Events"}
            </h1>
            <p className="text-muted-foreground">
              Found {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowUpcoming(!showUpcoming)}
              className="rounded-xl"
            >
              {showUpcoming ? "Show All Events" : "Show Upcoming Only"}
            </Button>
            <div className="w-48">
              <label className="text-sm font-medium block mb-2">Sort by</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border rounded-2xl">
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="earliest">Earliest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-xl border-0 rounded-3xl mb-8">
        <CardContent className="p-6">
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

          {/* Apply and Clear Buttons */}
          {hasActiveFilters && (
            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button onClick={handleSearch} className="rounded-xl bg-accent hover:bg-accent/90">
                Apply Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Grid */}
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
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Try searching with different keywords"}
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
