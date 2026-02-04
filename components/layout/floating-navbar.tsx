"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function FloatingNavbar() {
  return (
    <nav 
      className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-transparent backdrop-blur-lg rounded-full flex justify-between items-center"
      style={{
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px"
      }}
    >
      <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 md:gap-6 w-full">
        {/* Left Side: Logo and Search */}
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/EVENTHIVE.png"
              alt="EventHive Logo"
              className="h-6 md:h-8 w-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md bg-transparent h-auto">
            <div
              className="flex items-center gap-3 rounded-full p-1 bg-transparent focus-within:bg-gray-100 transition-colors group h-auto"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
              }}
            >
              <Input
                type="text"
                placeholder="Search events..."
                className="flex-1 border-0 bg-transparent focus-visible:bg-white focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 text-sm placeholder:text-muted-foreground rounded-full  transition-all"
                style={{
                  boxShadow: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px")
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              {/* <div className="h-6 w-[1px] bg-border" />
              <Input
                type="text"
                placeholder="Nagpur, IN"
                className="w-32 md:w-40 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 text-sm placeholder:text-muted-foreground"
              /> */}
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-accent hover:bg-accent/90 shrink-0"
              >
                <Search className="h-4 w-4 text-background" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Links and Sign In Button */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <Link 
            href="/" 
            className="text-sm font-medium hover:text-accent transition-colors hidden md:block"
          >
            Home
          </Link>
          <Link 
            href="/post-event" 
            className="text-sm font-medium hover:text-accent transition-colors hidden md:block"
          >
            Post Event
          </Link>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-4 md:px-6 py-2 text-xs md:text-sm font-semibold">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
}
