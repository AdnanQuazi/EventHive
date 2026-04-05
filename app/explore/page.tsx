import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { ExploreEvents } from "@/components/sections/explore-events";
import { getPublicEvents, getEventCities } from "@/lib/actions/events";

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    type?: "online" | "offline";
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const { category, city, type } = params;

  // Fetch all public events
  const eventsResult = await getPublicEvents();
  const citiesResult = await getEventCities();

  const events = eventsResult.data || [];
  const cities = citiesResult.data || [];

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

        <ExploreEvents
          initialEvents={events}
          availableCities={cities}
          initialCategory={category}
          initialCity={city}
          initialType={type}
        />
      </main>
    </>
  );
}
