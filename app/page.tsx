"use client"

import { FloatingNavbar } from "@/components/layout/floating-navbar"
import { HeroSection } from "@/components/sections/hero-section"
import { FloatingElements } from "@/components/sections/floating-elements"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
{/* 2. Ambient Glows */}
<div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
<div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
<div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />
      <FloatingNavbar />
      <FloatingElements />
      <HeroSection />
    </main>
  )
}
