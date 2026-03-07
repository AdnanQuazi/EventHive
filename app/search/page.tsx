import { SearchResults } from "@/components/sections/search-results";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { searchEvents, getEventCities } from "@/lib/actions/events";
import { redirect } from "next/navigation";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    type?: "online" | "offline";
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q, category, city, type } = params;

  // Redirect to home if no search query
  if (!q && !category && !city && !type) {
    redirect("/");
  }

  // Fetch search results
  const searchResult = await searchEvents({
    query: q,
    category: category,
    city: city,
    eventType: type,
  });

  // Fetch available cities for filter
  const citiesResult = await getEventCities();

  const events = searchResult.data || [];
  const cities = citiesResult.data || [];

  return (
    <>
      <FloatingNavbar />
      <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-100 h-100 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

        <SearchResults
          initialEvents={events}
          initialQuery={q || ""}
          initialCategory={category}
          initialCity={city}
          initialType={type}
          availableCities={cities}
        />
      </main>
    </>
  );
}
