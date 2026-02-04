"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Users, Building2, Sparkles } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const stats: Stat[] = [
  {
    id: "events",
    label: "Events Hosted",
    value: 15000,
    suffix: "+",
    icon: Calendar,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "users",
    label: "Active Users",
    value: 50000,
    suffix: "+",
    icon: Users,
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "partners",
    label: "Partner Organizations",
    value: 500,
    suffix: "+",
    icon: Building2,
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "registrations",
    label: "Event Registrations",
    value: 100000,
    suffix: "+",
    icon: Sparkles,
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
];

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedCounter({ end, duration = 2000, suffix = "", prefix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const current = Math.floor(easeOutQuart * end);

      setCount(current);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);

  return (
    <div ref={counterRef} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

interface StatsSectionProps {
  title?: string;
  subtitle?: string;
}

export function StatsSection({
  title = "Trusted by Thousands",
  subtitle = "Join a thriving community of event organizers and attendees",
}: StatsSectionProps) {
  return (
    <section className="relative px-4 py-16 pb-0 overflow-hidden wrapper">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.id}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-default hover:scale-105 hover:-translate-y-1 p-8 border-0 shadow-none rounded-2xl flex flex-col items-center justify-center gap-4 min-h-[200px]"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Icon Container */}
                <div className="relative z-10 bg-white/10 group-hover:bg-white/20 backdrop-blur-sm rounded-full p-4 transition-all duration-300 group-hover:scale-110">
                  <Icon className={`w-8 h-8 ${stat.color} transition-transform duration-300`} />
                </div>

                {/* Counter */}
                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    <AnimatedCounter
                      end={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      duration={2500}
                    />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                    {stat.label}
                  </p>
                </div>

                {/* Hover Border Glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300" />

                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-300" />
                <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-300" />
              </Card>
            );
          })}
        </div>

        {/* Optional decorative line */}
        <div className="mt-12 flex items-center justify-center">
          <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
