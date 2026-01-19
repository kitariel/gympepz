"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";

import { GuestModeBanner } from "@/app/portal/_guest/guest-mode-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { resolveAppMode } from "@/lib/app-mode";

type Gym = {
  id: string;
  name: string;
  area: string;
  tags: string[];
};

const SAMPLE_GYMS: Gym[] = [
  { id: "g1", name: "Iron District Gym", area: "Downtown", tags: ["24/7", "Powerlifting"] },
  { id: "g2", name: "Peak Strength Club", area: "Midtown", tags: ["Olympic", "Coaching"] },
  { id: "g3", name: "Metro Fitness Lab", area: "Uptown", tags: ["Machines", "Sauna"] },
  { id: "g4", name: "Warehouse Barbell", area: "Industrial", tags: ["Strongman", "Platforms"] },
];

export default function GymsPage() {
  const { data: session } = useSession();
  const mode = resolveAppMode(session);

  const [q, setQ] = useState("");

  const gyms = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return SAMPLE_GYMS;
    return SAMPLE_GYMS.filter((g) => {
      return (
        g.name.toLowerCase().includes(query) ||
        g.area.toLowerCase().includes(query) ||
        g.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [q]);

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gym discovery</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Browse nearby gyms. Save favorites when you create an account.
            </p>
          </div>
          {mode === "authenticated" ? (
            <Button asChild size="sm" className="h-9">
              <Link href="/portal/account">Manage</Link>
            </Button>
          ) : null}
        </div>

        {mode === "guest" ? <GuestModeBanner /> : null}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search gyms by name, area, or equipment…"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {gyms.map((g) => (
          <Card key={g.id} className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-base">{g.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{g.area}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
              {mode === "guest" ? (
                <Button asChild variant="outline" size="sm" className="h-9 w-full">
                  <Link href="/login">Save this gym (create account)</Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="h-9 w-full">
                  Save to favorites
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TODO: replace sample data with real location search results via API */}
    </div>
  );
}

