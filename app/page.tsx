import { FloatingNavbar } from "@/components/layout/floating-navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { FloatingElements } from "@/components/sections/floating-elements"
import { TrendingEvents } from "@/components/sections/trending-events"
import { EventCategories } from "@/components/sections/event-categories"
import { HowItWorks } from "@/components/sections/how-it-works"
import { StatsSection } from "@/components/sections/stats-section"
import { EventOrganizers } from "@/components/sections/event-organizers"
import { Footer } from "@/components/sections/footer"
import { getPublicEvents } from "@/lib/actions/events"

export default async function LandingPage() {
  // Fetch recent upcoming events from database
  const eventsResult = await getPublicEvents({ 
    limit: 8,
    startDateFrom: new Date().toISOString(),
  });
  const events = eventsResult.data || [];
  return (
    <main className="min-h-screen bg-gray-100 text-foreground font-sans relative overflow-hidden">
{/* 2. Ambient Glows */}
<div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
<div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
<div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />
      <FloatingNavbar />
      <HeroSection />
      <TrendingEvents events={events} />
      <EventCategories />
      <HowItWorks />
      <EventOrganizers />
      <Footer />
    </main>
  )
}
