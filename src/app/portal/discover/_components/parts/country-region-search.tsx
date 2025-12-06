"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { env } from "@/env";

type GeocodeFeature = {
  id: string;
  place_name: string;
  center?: [number, number];
  properties?: { short_code?: string };
  place_type?: string[];
};
type MapboxResponse = {
  features?: GeocodeFeature[];
};

export function CountryRegionSearch({
  country,
  region,
  regionScope,
  onCountryChange,
  onRegionChange,
  onRegionScopeChange,
}: {
  country: string;
  region: string;
  regionScope: "province_state" | "city_town";
  onCountryChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onRegionScopeChange: (v: "province_state" | "city_town") => void;
}) {
  const [countryQuery, setCountryQuery] = useState<string>(country);
  const [regionQuery, setRegionQuery] = useState<string>(region);
  const [countryResults, setCountryResults] = useState<GeocodeFeature[]>([]);
  const [regionResults, setRegionResults] = useState<GeocodeFeature[]>([]);
  const [showCountryResults, setShowCountryResults] = useState<boolean>(false);
  const [showRegionResults, setShowRegionResults] = useState<boolean>(false);

  const handleRegionScopeChange = (
    v: "province_state" | "city_town",
  ) => {
    setShowRegionResults(false);
    onRegionScopeChange(v);
  };
  const [selectedCountryCode, setSelectedCountryCode] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setCountryQuery(country);
  }, [country]);
  useEffect(() => {
    setRegionQuery(region);
  }, [region]);

  const token = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    const q = countryQuery.trim();
    if (!token || q.length < 2) {
      setCountryResults([]);
      return;
    }
    const ctrl = new AbortController();
    const url = new URL(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(q) +
        ".json",
    );
    url.searchParams.set("types", "country");
    url.searchParams.set("limit", "6");
    url.searchParams.set("access_token", token);
    fetch(url.toString(), { signal: ctrl.signal })
      .then((r) => r.json() as Promise<MapboxResponse>)
      .then((data) => setCountryResults(data.features ?? []))
      .catch(() => {
        /* empty */
      });
    return () => ctrl.abort();
  }, [countryQuery, token]);

  useEffect(() => {
    const q = regionQuery.trim();
    if (!token || q.length < 2 || !selectedCountryCode) {
      setRegionResults([]);
      return;
    }
    const ctrl = new AbortController();
    const url = new URL(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(q) +
        ".json",
    );
    url.searchParams.set(
      "types",
      regionScope === "province_state" ? "region,district" : "place,locality",
    );
    url.searchParams.set("limit", "8");
    url.searchParams.set("country", selectedCountryCode);
    url.searchParams.set("access_token", token);
    fetch(url.toString(), { signal: ctrl.signal })
      .then((r) => r.json() as Promise<MapboxResponse>)
      .then((data) => {
        const feats = data.features ?? [];
        const filtered = feats.filter((f) =>
          (f.place_type ?? []).some((t) =>
            regionScope === "province_state"
              ? t === "region" || t === "district"
              : t === "place" || t === "locality",
          ),
        );
        setRegionResults(filtered);
      })
      .catch(() => {
        /* empty */
      });
    return () => ctrl.abort();
  }, [regionQuery, selectedCountryCode, token, regionScope]);

  useEffect(() => {
    const q = countryQuery.trim();
    if (!token || q.length < 2) return;
    const ctrl = new AbortController();
    const url = new URL(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(q) +
        ".json",
    );
    url.searchParams.set("types", "country");
    url.searchParams.set("limit", "1");
    url.searchParams.set("access_token", token);
    fetch(url.toString(), { signal: ctrl.signal })
      .then((r) => r.json() as Promise<MapboxResponse>)
      .then((data) => {
        const f = (data.features ?? [])[0];
        const code = f?.properties?.short_code ?? undefined;
        if (code) setSelectedCountryCode(code);
      })
      .catch(() => {
        /* empty */
      });
    return () => ctrl.abort();
  }, [countryQuery, token]);

  const onChooseCountry = (f: GeocodeFeature) => {
    const name = f.place_name ?? countryQuery;
    const code = f.properties?.short_code ?? undefined;
    setSelectedCountryCode(code);
    setCountryQuery(name);
    setShowCountryResults(false);
    setCountryResults([]);
    // Clear area when country changes
    setRegionQuery("");
    setRegionResults([]);
    setShowRegionResults(false);
    onRegionChange("");
    onCountryChange(name);
  };
  const onChooseRegion = (f: GeocodeFeature) => {
    const name = f.place_name ?? regionQuery;
    setRegionQuery(name);
    setShowRegionResults(false);
    setRegionResults([]);
    onRegionChange(name);
  };

  const disableRegion = !selectedCountryCode;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Country</Label>
        <Input
          value={countryQuery}
          onChange={(e) => {
            setCountryQuery(e.target.value);
            setShowCountryResults(true);
          }}
          placeholder="Search country"
        />
        {showCountryResults && countryResults.length > 0 && (
          <ul className="bg-popover text-popover-foreground max-h-48 overflow-auto rounded-md border p-1">
            {countryResults.map((f) => (
              <li
                key={f.id}
                className="hover:bg-muted cursor-pointer rounded px-2 py-1"
                onClick={() => onChooseCountry(f)}
              >
                {f.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label>Area</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={regionScope === "province_state" ? "default" : "outline"}
            onClick={() => handleRegionScopeChange("province_state")}
          >
            Province/State
          </Button>
          <Button
            type="button"
            size="sm"
            variant={regionScope === "city_town" ? "default" : "outline"}
            onClick={() => handleRegionScopeChange("city_town")}
          >
            City/Town
          </Button>
        </div>
        <Input
          value={regionQuery}
          onChange={(e) => {
            setRegionQuery(e.target.value);
            setShowRegionResults(true);
          }}
          placeholder={
            regionScope === "province_state"
              ? "Search province/state"
              : "Search city/town"
          }
          disabled={disableRegion}
        />
        {showRegionResults && regionResults.length > 0 && (
          <ul className="bg-popover text-popover-foreground max-h-48 overflow-auto rounded-md border p-1">
            {regionResults.map((f) => (
              <li
                key={f.id}
                className="hover:bg-muted cursor-pointer rounded px-2 py-1"
                onClick={() => onChooseRegion(f)}
              >
                {f.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
