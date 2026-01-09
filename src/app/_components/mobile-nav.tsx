"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

interface MobileNavProps {
  session: unknown;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="text-foreground hover:bg-muted/50 rounded-lg p-2 transition-colors md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div className="bg-background/95 border-border fixed top-20 right-0 left-0 z-50 border-b shadow-lg backdrop-blur-xl md:hidden">
            <nav className="container mx-auto space-y-4 px-6 py-6">
              <Link
                href="#home"
                onClick={closeMenu}
                className="text-muted-foreground hover:text-foreground block py-2 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                Home
              </Link>
              <Link
                href="#about"
                onClick={closeMenu}
                className="text-muted-foreground hover:text-foreground block py-2 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                About
              </Link>
              <Link
                href="#how-it-works"
                onClick={closeMenu}
                className="text-muted-foreground hover:text-foreground block py-2 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#programs"
                onClick={closeMenu}
                className="text-muted-foreground hover:text-foreground block py-2 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                Programs
              </Link>
              <Link
                href="#contact"
                onClick={closeMenu}
                className="text-muted-foreground hover:text-foreground block py-2 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                Contact
              </Link>
              <div className="border-border border-t pt-4">
                {session ? (
                  <Link href="/portal" onClick={closeMenu}>
                    <Button className="w-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-xs font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                      Go to Portal
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={closeMenu}>
                    <Button className="w-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-xs font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
