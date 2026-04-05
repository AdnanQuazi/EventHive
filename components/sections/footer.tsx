"use client";

import { 
  Heart,
  Mail,
  MapPin,
  Twitter,
  Github,
  Linkedin,
  Instagram,
} from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
  { icon: Github, href: "#", label: "GitHub", color: "hover:text-foreground" },
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background to-accent/5 border-t border-white/10">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                EventHive
              </span>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground ${social.color} transition-all duration-300 hover:scale-110 hover:border-white/20`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Email</p>
                <a href="mailto:atharvapawar80078@gmail.com" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  atharvapawar80078@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Address</p>
                <p className="text-sm text-muted-foreground">
                  123 Innovation Street, Tech Valley, CA 94025
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 EventHive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
