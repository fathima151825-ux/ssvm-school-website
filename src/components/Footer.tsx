"use client";

import React from "react";
import Link from "next/link";
import AppLogo from "@/components/ui/AppLogo";
import Icon from "@/components/ui/AppIcon";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark border-t-4 border-primary">
      {/* Divider shimmer */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <AppLogo size={40} />
            <div>
              <p className="font-heading font-700 text-white text-sm leading-tight">
                Sri Saraswathi Vidhya Mandir
              </p>
              <p className="text-xs text-white/50 font-body">
                Matriculation School · Chennai
              </p>
            </div>
          </div>

          {/* Center Links */}
          <div className="flex items-center gap-6 text-sm font-heading font-500">
            <button
              onClick={() => {
                const el = document.getElementById("home");
                if (el) window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-white/60 hover:text-accent transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-white/60 hover:text-accent transition-colors"
            >
              About
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-white/60 hover:text-accent transition-colors"
            >
              Contact
            </button>
            <Link
              href="/admin-panel"
              className="text-white/60 hover:text-accent transition-colors flex items-center gap-1"
            >
              <Icon name="LockClosedIcon" size={12} />
              Admin
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-xs font-body text-center md:text-right">
            © {year} Sri Saraswathi Vidhya Mandir<br />
            <a href="mailto:ssvm2003@gmail.com" className="text-white/50 hover:text-accent transition-colors">ssvm2003@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;