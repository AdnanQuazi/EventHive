"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function FloatingNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      setUser(null); // Update local state immediately
      router.push("/"); // Navigate to home
      router.refresh(); // Refresh to update server components
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

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

        {/* Right Side: Navigation Links and Auth Section */}
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
          
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserAvatar()} alt={user.user_metadata?.name || user.email} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-4 md:px-6 py-2 text-xs md:text-sm font-semibold"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
