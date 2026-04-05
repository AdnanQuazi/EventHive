"use client";

import Link from "next/link";
import { 
  Music, 
  Laptop, 
  Trophy, 
  Briefcase, 
  Users, 
  Palette, 
  Utensils,
  Heart,
  GraduationCap,
  Camera,
  Gamepad2,
  Plane,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "../ui/button";

interface Category {
  id: string;
  name: string;
  displayName: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const categories: Category[] = [
  {
    id: "music",
    name: "Music",
    displayName: "Music",
    icon: Music,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "tech",
    name: "Technology",
    displayName: "Tech",
    icon: Laptop,
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "sports",
    name: "Sports",
    displayName: "Sports",
    icon: Trophy,
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "workshops",
    name: "Workshop",
    displayName: "Workshops",
    icon: GraduationCap,
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "networking",
    name: "Networking",
    displayName: "Networking",
    icon: Users,
    color: "text-indigo-500",
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
  {
    id: "business",
    name: "Business",
    displayName: "Business",
    icon: Briefcase,
    color: "text-slate-500",
    gradient: "from-slate-500/20 to-gray-500/20",
  },
  {
    id: "arts",
    name: "Arts & Culture",
    displayName: "Arts & Culture",
    icon: Palette,
    color: "text-pink-500",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "food",
    name: "Food & Drink",
    displayName: "Food & Drink",
    icon: Utensils,
    color: "text-amber-500",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  {
    id: "health",
    name: "Health & Wellness",
    displayName: "Health & Wellness",
    icon: Heart,
    color: "text-red-500",
    gradient: "from-red-500/20 to-pink-500/20",
  },
  {
    id: "education",
    name: "Education",
    displayName: "Education",
    icon: Camera,
    color: "text-teal-500",
    gradient: "from-teal-500/20 to-cyan-500/20",
  },
  {
    id: "gaming",
    name: "Gaming",
    displayName: "Gaming",
    icon: Gamepad2,
    color: "text-violet-500",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    displayName: "Entertainment",
    icon: Plane,
    color: "text-sky-500",
    gradient: "from-sky-500/20 to-blue-500/20",
  },
];

export function EventCategories() {

  return (
    <section className="relative px-4 py-16 pb-0 overflow-hidden wrapper">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Explore by Category
            </h2>
          </div>
          <Link href="/explore">
            <Button
              variant="ghost"
              className="text-accent hover:text-accent/90 hover:bg-accent/10 gap-2 rounded-full px-6 transition-all"
            >
              Browse All Categories
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} href={`/explore?category=${encodeURIComponent(category.name)}`}>
                <Card
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 p-6 border-0 shadow-none rounded-2xl flex flex-col items-center justify-center gap-3 min-h-[140px]"
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  
                  {/* Icon Container */}
                  <div className="relative z-10 bg-white/10 group-hover:bg-white/20 backdrop-blur-sm rounded-full p-4 transition-all duration-300 group-hover:scale-110">
                    <Icon className={`w-8 h-8 ${category.color} transition-transform duration-300`} />
                  </div>

                  {/* Category Name */}
                  <h3 className="relative z-10 text-sm font-semibold text-center text-foreground group-hover:text-foreground transition-colors duration-300">
                    {category.displayName}
                  </h3>

                  {/* Hover Border Glow */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
