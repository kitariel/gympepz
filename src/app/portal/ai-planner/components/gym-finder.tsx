"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, ExternalLink, Loader2 } from "lucide-react";

export function GymFinder() {
  const [address, setAddress] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const gymsQuery = api.location.searchGyms.useQuery(
    { address, limit: 5 },
    { enabled: searchTriggered && address.length > 0 },
  );

  const handleSearch = () => {
    if (address.trim()) {
      setSearchTriggered(true);
    }
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="border-primary/20 bg-primary/5 max-w-[90%] border shadow-sm sm:max-w-[85%]">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="text-primary h-4 w-4" />
          Find Gyms Near You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter your address or city"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setSearchTriggered(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="h-9 text-sm"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSearch}
            disabled={!address.trim() || gymsQuery.isLoading}
            className="h-9 gap-1.5"
          >
            {gymsQuery.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {gymsQuery.data?.error && (
          <div className="text-destructive bg-destructive/10 rounded-md p-2 text-xs">
            {gymsQuery.data.error}
          </div>
        )}

        {gymsQuery.data?.gyms && gymsQuery.data.gyms.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              Found {gymsQuery.data.gyms.length} gyms nearby:
            </p>
            {gymsQuery.data.gyms.map((gym, idx) => (
              <div
                key={idx}
                className="bg-background hover:bg-accent/50 flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold">{gym.name}</h4>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {gym.address}
                  </p>
                  {gym.distance && (
                    <Badge variant="secondary" className="mt-1.5 text-[10px]">
                      {(gym.distance / 1000).toFixed(1)} km away
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 text-xs"
                  onClick={() =>
                    openInMaps(
                      gym.coordinates.latitude,
                      gym.coordinates.longitude,
                      gym.name,
                    )
                  }
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchTriggered &&
          !gymsQuery.isLoading &&
          gymsQuery.data?.gyms.length === 0 &&
          !gymsQuery.data?.error && (
            <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
              No gyms found near this location. Try a different address.
            </div>
          )}
      </CardContent>
    </Card>
  );
}
