"use client"

import { MapPin, Users, Bell, Calendar, QrCode, BarChart3, Ticket } from "lucide-react"

const ANALYTICS_BAR_HEIGHTS = [46, 58, 71, 63, 55, 68]

export function FloatingElements() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      
      {/* LEFT — Ticket */}
      <div className="absolute top-50 left-1/2 -translate-x-[calc(50%+22rem)]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float -rotate-6 w-64">
          <div className="flex items-center gap-2 mb-3">
            <Ticket className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Event Ticket</h3>
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
      </div>

      {/* LEFT — Members */}
      <div className="absolute top-[420px] left-1/2 -translate-x-[calc(50%+20rem)]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float-delayed rotate-3 w-64">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Club Members</h3>
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
          <p className="text-xs text-muted-foreground mt-2">120+ active members</p>
        </div>
      </div>

      {/* RIGHT — Analytics */}
      <div className="absolute top-24 left-1/2 translate-x-[calc(50%+22rem)]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float-slow rotate-6 w-64">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Analytics</h3>
          </div>
          <div className="h-24 bg-gradient-to-br from-accent/20 to-pastel-blue/20 rounded-lg flex items-end justify-between p-2 gap-1">
            {ANALYTICS_BAR_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-accent rounded-t"
                style={{
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Events this month</p>
        </div>
      </div>

      {/* RIGHT — Location */}
      <div className="absolute top-[420px] left-1/2 translate-x-[calc(50%+20rem)]">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl float -rotate-3 w-64">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Location</h3>
          </div>
          <div className="h-32 bg-gradient-to-br from-accent/20 to-pastel-green/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-12 h-12 text-accent/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Find events near you</p>
        </div>
      </div>

      {/* Top Right QR Code */}
      <div className="absolute top-32 left-1/2 translate-x-[calc(50%+16rem)]">
        <div className="glass-strong rounded-xl p-4 float shadow-lg rotate-12">
          <div className="w-32 h-32 bg-foreground rounded-lg flex items-center justify-center">
            <QrCode className="w-24 h-24 text-background" />
          </div>
        </div>
      </div>

      {/* Small floating accents */}
      <div className="absolute top-1/3 left-1/4 opacity-60">
        <div className="glass rounded-full p-2 float">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="absolute bottom-1/3 right-1/4 opacity-60">
        <div className="glass rounded-full p-2 float-delayed">
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="absolute top-2/3 left-1/4 opacity-50">
        <div className="glass rounded-full p-3 float-slow">
          <div className="w-6 h-6 rounded-full bg-pastel-pink" />
        </div>
      </div>
    </div>
  )
}
