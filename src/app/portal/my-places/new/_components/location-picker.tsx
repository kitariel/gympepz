"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useState } from "react";
import { env } from "@/env";
import Map, { NavigationControl, GeolocateControl, Marker, type ViewState } from "react-map-gl/mapbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LocationPickerProps = {
  latitude?: number | null;
  longitude?: number | null;
  onPick: (lat: number, lng: number) => void;
};

type Result = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export default function LocationPicker({ latitude, longitude, onPick }: LocationPickerProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (latitude && longitude) {
      setSelected({ lat: latitude, lng: longitude });
      setViewState({
        latitude,
        longitude,
        zoom: 14,
        bearing: viewState.bearing,
        pitch: viewState.pitch,
        padding: viewState.padding,
      });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const q = query.trim();
        if (!q) {
          setResults([]);
          return;
        }
        if (!env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return;
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=5`;
          const res = await fetch(url);
          const json = (await res.json()) as { features?: Array<{ id?: string; place_name?: string; center?: [number, number] }> };
          const feats = Array.isArray(json.features) ? json.features : [];
          const mapped: Result[] = feats
            .map((f) => ({ id: String(f.id ?? Math.random()), name: String(f.place_name ?? ""), lat: Number(f.center?.[1] ?? 0), lng: Number(f.center?.[0] ?? 0) }))
            .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
          setResults(mapped);
        } catch {
          setResults([]);
        }
      })();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const token = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const canUseMap = useMemo(() => Boolean(token), [token]);

  return (
    <div className="md:grid md:grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Latitude</label>
            <Input value={selected?.lat ?? ""} readOnly disabled placeholder="auto-set via map/search" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Longitude</label>
            <Input value={selected?.lng ?? ""} readOnly disabled placeholder="auto-set via map/search" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search location (address, place)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    setSelected({ lat, lng });
                    setViewState({
                      latitude: lat,
                      longitude: lng,
                      zoom: 14,
                      bearing: viewState.bearing,
                      pitch: viewState.pitch,
                      padding: viewState.padding,
                    });
                    onPick(lat, lng);
                  },
                  undefined,
                  { enableHighAccuracy: true, timeout: 10000 },
                );
              }
            }}
          >
            Use my location
          </Button>
        </div>

        {results.length > 0 && (
          <Card className="p-2">
            <div className="grid gap-1">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="text-left text-sm hover:bg-muted rounded px-2 py-2"
                  onClick={() => {
                    setSelected({ lat: r.lat, lng: r.lng });
                    setViewState({
                      latitude: r.lat,
                      longitude: r.lng,
                      zoom: 14,
                      bearing: viewState.bearing,
                      pitch: viewState.pitch,
                      padding: viewState.padding,
                    });
                    onPick(r.lat, r.lng);
                  }}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="rounded-lg border min-h-[320px]">
        {canUseMap ? (
          <Map
            mapboxAccessToken={token}
            longitude={viewState.longitude}
            latitude={viewState.latitude}
            zoom={viewState.zoom}
            bearing={viewState.bearing}
            pitch={viewState.pitch}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: "100%", height: 360, borderRadius: 8 }}
            onMove={(e) => setViewState(e.viewState)}
            onClick={(e: { lngLat?: { lat?: number; lng?: number } }) => {
              const lat = e.lngLat?.lat ?? 0;
              const lng = e.lngLat?.lng ?? 0;
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
              setSelected({ lat, lng });
              setViewState({
                latitude: lat,
                longitude: lng,
                zoom: 14,
                bearing: viewState.bearing,
                pitch: viewState.pitch,
                padding: viewState.padding,
              });
              onPick(lat, lng);
            }}
          >
            <NavigationControl position="top-right" />
            <GeolocateControl position="top-left" positionOptions={{ enableHighAccuracy: true }} trackUserLocation />
            {selected && (
              <Marker longitude={selected.lng} latitude={selected.lat} />
            )}
          </Map>
        ) : (
          <div className="text-muted-foreground p-4 text-sm">Missing Mapbox access token</div>
        )}
      </div>
    </div>
  );
}