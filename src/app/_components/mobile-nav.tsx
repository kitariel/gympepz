"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

interface MobileNavProps {
  session: any;
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
        className="md:hidden text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-20 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border z-50 md:hidden shadow-lg">
            <nav className="container mx-auto px-6 py-6 space-y-4">
              <Link
                href="#home"
                onClick={closeMenu}
                className="block text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs font-medium py-2"
              >
                Home
              </Link>
              <Link
                href="#about"
                onClick={closeMenu}
                className="block text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs font-medium py-2"
              >
                About
              </Link>
              <Link
                href="#how-it-works"
                onClick={closeMenu}
                className="block text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs font-medium py-2"
              >
                How It Works
              </Link>
              <Link
                href="#programs"
                onClick={closeMenu}
                className="block text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs font-medium py-2"
              >
                Programs
              </Link>
              <Link
                href="#contact"
                onClick={closeMenu}
                className="block text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs font-medium py-2"
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-border">
                {session ? (
                  <Link href="/portal" onClick={closeMenu}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-xs font-semibold tracking-wide">
                      Go to Portal
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={closeMenu}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-xs font-semibold tracking-wide">
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
