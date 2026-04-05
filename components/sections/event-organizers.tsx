"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Users, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Reach More People",
    description: "Connect with thousands of potential attendees across your campus and city",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Community",
    description: "Build lasting relationships and expand your network effortlessly",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: BarChart3,
    title: "Track Analytics",
    description: "Get detailed insights on registrations, engagement, and event performance",
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security for your events and attendee data",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
  },
];

export function EventOrganizers() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">FOR EVENT ORGANIZERS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 text-foreground">
            Start Hosting Events <br />
            <span className="bg-gradient-to-r from-accent via-purple-500 to-pink-500 bg-clip-text text-transparent">
              That Matter
            </span>
          </h2>
          <p className="text-md text-muted-foreground max-w-3xl mx-auto">
            Whether you&apos;re organizing college fests, hackathons, workshops, or local meetups, 
            EventHive provides everything you need to create memorable experiences.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-br from-accent/10 via-purple-500/10 to-pink-500/10 border border-white/20 rounded-3xl p-12 text-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-accent animate-pulse" />
              <span className="text-sm font-bold text-accent uppercase tracking-wider">
                Ready to get started?
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Create Your First Event Today
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of organizers who trust EventHive to bring their communities together. 
              It&apos;s free to get started, and takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 py-6 text-base font-bold shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300"
              >
                Create Event →
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white/20 hover:bg-white/5 rounded-full px-8 py-6 text-base font-bold transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
