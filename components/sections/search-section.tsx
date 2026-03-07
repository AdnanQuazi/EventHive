"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const popularSearches = [
  { label: "🎵 Music", value: "Music" },
  { label: "💻 Tech", value: "Technology" },
  { label: "🎨 Workshop", value: "Workshop" },
  { label: "🚀 Business", value: "Business" },
]

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePopularSearch = (category: string) => {
    router.push(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="relative z-10 -mt-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Search Bar */}
        <div className="glass rounded-2xl p-4 flex items-center gap-3 mb-6">
          <Input
            type="text"
            placeholder="Search events, clubs, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground text-lg"
          />
          <Button 
            size="icon"
            onClick={handleSearch}
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full w-12 h-12 shrink-0 glow-accent"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Floating Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Popular:</span>
          {popularSearches.map((search) => (
            <Badge
              key={search.value}
              variant="outline"
              onClick={() => handlePopularSearch(search.value)}
              className="glass rounded-full px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent/10 hover:border-accent/50 transition-all border-glass-border"
            >
              {search.label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
