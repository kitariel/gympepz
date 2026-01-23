import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";

type LandingHeaderProps = {
  ctaHref: string;
};

export default function LandingHeader({ ctaHref }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">GymPepz</p>
            <p className="text-xs text-muted-foreground">Train smarter, lift more</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="#features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link href="#planning" className="transition hover:text-foreground">
            Weekly Plan
          </Link>
          <Link href="#faq" className="transition hover:text-foreground">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-foreground/80 transition hover:text-foreground sm:inline-flex"
          >
            Log in
          </Link>
          <Button asChild size="sm" className="h-9 px-4 text-sm font-semibold">
            <Link href={ctaHref}>Start Training</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
