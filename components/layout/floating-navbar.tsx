"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FloatingNavbar() {
  return (
    <nav className="fixed top-[30px] left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
      <div className="bg-white backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img 
            src="/EVENTHIVE.png" 
            alt="EventHive Logo" 
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <Link 
            href="/explore" 
            className="text-foreground/80 hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap"
          >
            Explore
          </Link>
          <Link 
            href="/clubs" 
            className="text-foreground/80 hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap hidden md:inline-block"
          >
            Clubs
          </Link>
          <Link 
            href="/pricing" 
            className="text-foreground/80 hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap hidden md:inline-block"
          >
            Pricing
          </Link>
        </div>

        {/* Right Side Action */}
        <div className="flex items-center shrink-0">
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 py-2 text-sm font-semibold"
          >
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  )
}
