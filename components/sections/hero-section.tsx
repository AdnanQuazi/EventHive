"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

const categoryChips = [
  { label: "🎵 Music", value: "music" },
  { label: "🚀 Tech", value: "tech" },
  { label: "🎨 Art", value: "art" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-4 pt-[200px] pb-20 overflow-hidden">
      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-black tracking-tight mb-6 text-foreground leading-tight">
          Elevating The Way You Discover, Attend, And Analyze Local Events.
        </h1>
        
        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The smartest way to host and explore. Seamless analytics for organizers, unforgettable experiences for everyone else.
        </p>
        
        {/* CTA Button */}
        <Button 
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 py-7 text-lg font-bold mb-12"
        >
          Start Exploring
        </Button>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Input
              type="text"
              placeholder="Search events, clubs, or locations..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground text-base"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categoryChips.map((chip) => (
            <Badge
              key={chip.value}
              variant="outline"
              className="bg-transparent border-white/10 rounded-full px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent/10 hover:border-accent/50 transition-all"
            >
              {chip.label}
            </Badge>
          ))}
        </div>
        
      </div>
    </section>
  )
}
