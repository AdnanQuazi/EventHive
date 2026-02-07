import type { Metadata } from "next";
import { FloatingNavbar } from "@/components/layout/floating-navbar";

export const metadata: Metadata = {
  title: "Authentication - EventHive",
  description: "Sign in or create an account to access EventHive",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navbar */}
      <FloatingNavbar />
      
      {/* Ambient glow effects */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse [animation-delay:2s]" />
      
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen relative z-10 w-full px-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
