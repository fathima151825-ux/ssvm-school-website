"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppLogo from "@/components/ui/AppLogo";
import Icon from "@/components/ui/AppIcon";

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Gallery", href: "#gallery" },
  { label: "Videos", href: "#videos" },
  { label: "Contact", href: "#contact" },
];

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
    const sections = ["home", "about", "academics", "gallery", "videos", "contact"];
    let current = "home";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) current = id;
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-md py-2 border-b border-red-100"
            : "bg-white/90 backdrop-blur-sm py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/homepage" className="flex items-center gap-3 group" aria-label="Sri Saraswathi Vidhya Mandir Home">
            <AppLogo size={48} className="transition-transform duration-300 group-hover:scale-105" />
            <div className="hidden sm:block">
              <div className="font-heading font-800 text-primary text-sm leading-tight">
                Sri Saraswathi
              </div>
              <div className="font-heading font-600 text-primary-dark text-xs leading-tight">
                Vidhya Mandir
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`nav-link ${activeSection === item.href.slice(1) ? "active text-primary" : ""}`}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
  href="https://management.ssvm2003.in"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-heading font-700 text-sm hover:bg-primary-dark transition-all duration-300 shadow-primary"
>
  <Icon name="LockClosedIcon" size={15} variant="solid" />
  Login
</a>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 bg-surface text-primary hover:bg-primary hover:text-white transition-all duration-300"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? "XMarkIcon" : "Bars3Icon"} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`mobile-menu fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-2xl lg:hidden ${
          mobileOpen ? "open" : ""
        }`}
        role="dialog"
        aria-label="Mobile navigation menu"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <AppLogo size={40} />
              <span className="font-heading font-700 text-primary text-sm">SSVM</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface text-primary"
              aria-label="Close menu"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`text-left px-4 py-3 rounded-xl font-heading font-600 text-sm transition-all duration-200 ${
                  activeSection === item.href.slice(1)
                    ? "bg-primary text-white" :"text-foreground hover:bg-surface hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Login CTA */}
          <div className="mt-6 pt-6 border-t border-red-100">
           <a
  href="https://management.ssvm2003.in"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => setMobileOpen(false)}
  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white rounded-xl font-heading font-700 text-sm hover:bg-primary-dark transition-all duration-300"
>
  Login
</a>
              <Icon name="LockClosedIcon" size={15} variant="solid" />
              Login
            </a>
          </div>

          {/* School Info */}
          <div className="mt-6 p-4 bg-surface rounded-xl">
            <p className="text-xs text-muted font-body leading-relaxed">
              Estd. 2003 · State Board · English Medium<br />
              KG to XII · Chennai – 600095
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
