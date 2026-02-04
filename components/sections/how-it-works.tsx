"use client";

import { useState } from "react";
import { Search, UserPlus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "../ui/button";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  action: string;
  stepNumber: number;
}

const steps: Step[] = [
  {
    id: "discover",
    title: "Discover events and groups",
    description: "See who's hosting local events for all the things you love",
    icon: Search,
    color: "text-accent",
    gradient: "from-accent/20 to-blue-500/20",
    action: "Search events and groups",
    stepNumber: 1,
  },
  {
    id: "register",
    title: "Find your people",
    description: "Connect over shared interests, and enjoy meaningful experiences.",
    icon: UserPlus,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
    action: "Register for events",
    stepNumber: 2,
  },
  {
    id: "attend",
    title: "Start a group to host events",
    description: "Create your own EventHive group, and draw from a community of millions",
    icon: Calendar,
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
    action: "Start a group",
    stepNumber: 3,
  },
];

export function HowItWorks() {
  const [selectedStep, setSelectedStep] = useState(steps[0]);
  const SelectedIcon = selectedStep.icon;

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How It Works
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Side - Clickable Steps */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isSelected = selectedStep.id === step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                    isSelected
                      ? `border-white/30 bg-gradient-to-br ${step.gradient} shadow-lg`
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isSelected ? "shadow-md scale-110" : ""
                    }`}>
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          STEP {step.stepNumber}
                        </span>
                      </div>
                      <h3 className={`text-lg font-bold transition-colors mb-2 ${
                        isSelected ? "text-foreground" : "text-foreground/80"
                      }`}>
                        {step.title}
                      </h3>
                      
                      {/* Expandable Content */}
                      <div className={`transition-all duration-500 overflow-hidden ${
                        isSelected ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {step.description}
                        </p>
                        <Button
                          className={`${
                            step.id === 'discover' 
                              ? 'bg-accent hover:bg-accent/90' 
                              : step.id === 'register'
                              ? 'bg-purple-500 hover:bg-purple-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white rounded-full px-6 py-6 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-fit`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {step.action}
                        </Button>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="lg:col-span-7">
            <div className="sticky top-8 flex items-center justify-center">
              {/* Phone Frame */}
              <div className="relative w-full max-w-[380px]">
                {/* Phone Device */}
                <div className="relative mx-auto" style={{ width: '290px', height: '550px' }}>
                  {/* Phone Border & Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-[3rem] shadow-2xl border-[8px] border-foreground/90">
                    {/* Inner Screen Container */}
                    <div className="absolute inset-[0px] bg-background rounded-[2.5rem] overflow-hidden">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/90 rounded-b-2xl z-50" />
                      
                      {/* Status Bar */}
                      <div className="absolute top-0 left-0 right-0 h-12 bg-transparent z-40 px-8 pt-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-foreground">9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-3 border border-foreground/60 rounded-sm relative">
                            <div className="absolute inset-0.5 bg-foreground/60 rounded-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Screen Content - Slides based on selected step */}
                      <div className="absolute inset-0 top-12 overflow-hidden">
                        <div 
                          className="flex transition-transform duration-500 ease-in-out h-full"
                          style={{ 
                            transform: `translateX(-${(selectedStep.stepNumber - 1) * 33.333}%)`,
                            width: '300%'
                          }}
                        >
                          {/* Screen 1: Discover */}
                          <div className="w-1/3 flex-shrink-0 p-6 space-y-4">
                            {/* Search Bar */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-3 flex items-center gap-2">
                              <Search className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Search events near you</span>
                            </div>

                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {['Music', 'Tech', 'Food', 'Sports'].map((cat, i) => (
                                <div
                                  key={cat}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                    i === 0 ? 'bg-accent text-white' : 'bg-white/5 text-muted-foreground'
                                  }`}
                                >
                                  {cat}
                                </div>
                              ))}
                            </div>

                            {/* Event Cards */}
                            <div className="space-y-3">
                              {[
                                { title: 'Jazz Night Live', date: 'Feb 15', color: 'from-purple-500/20 to-pink-500/20' },
                                { title: 'Tech Summit 2026', date: 'Feb 18', color: 'from-blue-500/20 to-cyan-500/20' },
                                { title: 'Food Festival', date: 'Feb 20', color: 'from-orange-500/20 to-yellow-500/20' },
                              ].map((event, i) => (
                                <div
                                  key={i}
                                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex gap-3"
                                >
                                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${event.color} flex-shrink-0`} />
                                  <div className="flex-grow min-w-0">
                                    <h4 className="text-xs font-bold text-foreground truncate">{event.title}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{event.date} • 7:00 PM</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="w-3 h-3 rounded-full bg-accent/30" />
                                      <span className="text-[9px] text-muted-foreground">+120 going</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Screen 2: Register/Connect */}
                          <div className="w-1/3 flex-shrink-0 p-6 space-y-4">
                            {/* Success Badge */}
                            <div className="flex items-center justify-center">
                              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-2 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <div className="text-white text-xs font-bold">✓</div>
                                </div>
                                <span className="text-xs font-bold text-foreground">Registered</span>
                              </div>
                            </div>

                            {/* Event Card */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 space-y-3">
                              {/* Event Header */}
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                                  <UserPlus className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h4 className="text-sm font-bold text-foreground">Tech Summit 2026</h4>
                                  <p className="text-[10px] text-muted-foreground">Feb 18 • 2:00 PM</p>
                                </div>
                              </div>

                              {/* Ticket/QR Visual */}
                              <div className="bg-white/5 rounded-lg p-3 border border-dashed border-purple-500/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-semibold text-purple-400">TICKET #1284</span>
                                  <span className="text-[10px] text-muted-foreground">VIP</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="h-1.5 bg-purple-500/30 rounded-full" />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Community Section */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-semibold text-foreground">Who's going</span>
                                <span className="text-[10px] text-purple-400 font-semibold">+50</span>
                              </div>
                              
                              {/* Attendee Avatars */}
                              <div className="flex items-center -space-x-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 flex items-center justify-center text-xs font-bold border-2 border-background ring-1 ring-purple-500/20"
                                  >
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                ))}
                                <div className="w-9 h-9 rounded-full bg-purple-500/20 border-2 border-background ring-1 ring-purple-500/20 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-purple-400">+47</span>
                                </div>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-full py-3 text-xs font-bold transition-all duration-300 shadow-lg">
                              Connect with Attendees →
                            </button>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-2">
                              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-[10px] font-semibold text-foreground transition-colors">
                                Share Event
                              </button>
                              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-[10px] font-semibold text-foreground transition-colors">
                                Add to Calendar
                              </button>
                            </div>
                          </div>

                          {/* Screen 3: Create Event */}
                          <div className="w-1/3 flex-shrink-0 p-6 space-y-4">
                            <h3 className="text-base font-bold text-foreground">Create Your Event</h3>

                            {/* Form Fields */}
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Event Name</label>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                                  <span className="text-xs text-foreground">My Awesome Event</span>
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {['Music', 'Tech', 'Food'].map((cat, i) => (
                                    <div
                                      key={cat}
                                      className={`p-2 rounded-lg border text-center ${
                                        i === 1 
                                          ? 'bg-green-500/20 border-green-500/50' 
                                          : 'bg-white/5 border-white/10'
                                      }`}
                                    >
                                      <span className="text-[10px] font-semibold">{cat}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Date</label>
                                  <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[10px]">Feb 15</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Time</label>
                                  <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-2">
                                    <span className="text-[10px]">7:00 PM</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Stats Dashboard */}
                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-3 space-y-2">
                              <span className="text-[10px] font-semibold text-green-500">Event Analytics</span>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-foreground">24</div>
                                  <div className="text-[9px] text-muted-foreground">Registered</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-foreground">156</div>
                                  <div className="text-[9px] text-muted-foreground">Views</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-foreground">8</div>
                                  <div className="text-[9px] text-muted-foreground">Shares</div>
                                </div>
                              </div>
                            </div>

                            {/* Create Button */}
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-3 text-sm font-bold transition-colors">
                              Publish Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
