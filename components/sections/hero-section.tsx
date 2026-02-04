"use client";

import { Button } from "@/components/ui/button";
import { MapPin, QrCode, Ticket, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative px-4 mt-[250px] pb-20 overflow-hidden flex items-center justify-center  overflow-visible">
      <div className="relative flex items-center justify-center gap-5 w-full wrapper wrapper-hero">
        <div className="flex flex-col items-center justify-center gap-15">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float -rotate-6 w-64">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                Event Ticket
              </h3>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-accent/30 rounded" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dec 15, 2024</span>
                <span className="font-bold text-accent">EVENTHIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float-delayed rotate-3 w-70">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                Club Members
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-pastel-blue/30 flex items-center justify-center text-xs font-bold text-foreground border-2 border-white/10"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              120+ active members
            </p>
          </div>
        </div>
        <div className="relative z-10 text-center max-w-5xl min-w-2xl flex grow-1 justify-center items-center flex-col">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-foreground leading-tight">
            Elevating The Way You <br />
            Discover, Attend, And Analyze <br />
            Local Events.
          </h1>

          <p className="text-md md:text-md text-muted-foreground mb-8 max-w-2xl">
            From college fests and club activities to hackathons, workshops, and
            local meetups, EventHive brings everything into one place. Discover
            events you care about, register effortlessly, and track what’s
            happening around your campus and city.
          </p>

          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 py-6 text-md font-bold"
          >
            Start Exploring
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-15">
          <div className="glass-strong rounded-xl p-1 float shadow-lg rotate-12">
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 text-black bg-white" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float -rotate-3 w-64">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">
                Location
              </h3>
            </div>
            <div className="h-32 bg-gradient-to-br from-accent/20 to-pastel-green/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-12 h-12 text-accent/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Find events near you
            </p>
          </div>
        </div>
      </div>
      {/* Hero Content */}
    </section>
  );
}
