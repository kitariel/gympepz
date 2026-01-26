import Link from "next/link";
import { Dumbbell, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xl font-bold">Go-Train</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The workout tracker that helps you train smarter and track everything.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#planning"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Planning
                </Link>
              </li>
              <li>
                <Link
                  href="/train"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Start Training
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@gympepz.com"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Go-Train. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with <span className="text-red-500">❤️</span> for lifters everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
