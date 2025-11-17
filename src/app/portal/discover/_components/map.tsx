"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/env";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Layers, Check } from "lucide-react";

export function DiscoverMap({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 2,
  });
  type MapStyle = { id: string; name: string; url: string };
  const MAP_STYLES: MapStyle[] = [
    {
      id: "standard",
      name: "Standard (Auto Day/Night)",
      url: "mapbox://styles/mapbox/standard",
    },
    {
      id: "streets",
      name: "Streets",
      url: "mapbox://styles/mapbox/streets-v12",
    },
    {
      id: "satellite",
      name: "Satellite",
      url: "mapbox://styles/mapbox/satellite-streets-v12",
    },
    { id: "light", name: "Light", url: "mapbox://styles/mapbox/light-v11" },
    { id: "dark", name: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
  ];
  const [selectedStyleId, setSelectedStyleId] = useState<string>("standard");
  const [syncTheme, setSyncTheme] = useState<boolean>(true);

  const LS_STYLE_KEY = "discover.map.styleId";
  const LS_SYNC_THEME_KEY = "discover.map.syncTheme";
  const LS_VIEWSTATE_KEY = "discover.map.viewState";

  useEffect(() => {
    try {
      const savedSync = localStorage.getItem(LS_SYNC_THEME_KEY);
      if (savedSync !== null) {
        setSyncTheme(savedSync === "true");
      }
      const savedId = localStorage.getItem(LS_STYLE_KEY);
      if (savedId && MAP_STYLES.some((s) => s.id === savedId)) {
        setSelectedStyleId(savedId);
      }
      const savedView = localStorage.getItem(LS_VIEWSTATE_KEY);
      if (savedView) {
        const v = JSON.parse(savedView) as unknown;
        const lon = (v as Record<string, unknown>)?.longitude;
        const lat = (v as Record<string, unknown>)?.latitude;
        const zoom = (v as Record<string, unknown>)?.zoom;
        if (
          typeof lon === "number" &&
          typeof lat === "number" &&
          typeof zoom === "number"
        ) {
          setViewState({ longitude: lon, latitude: lat, zoom });
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_STYLE_KEY, selectedStyleId);
    } catch {}
  }, [selectedStyleId]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SYNC_THEME_KEY, String(syncTheme));
    } catch {}
  }, [syncTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_VIEWSTATE_KEY, JSON.stringify(viewState));
    } catch {}
  }, [viewState]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setViewState({ latitude, longitude, zoom: 14 });
        },
        () => {
          console.log("Error getting location");
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  if (!env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return <div className={className}>Missing Mapbox access token</div>;
  }

  const mapStyleUrl = syncTheme
    ? resolvedTheme === "dark"
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/light-v11"
    : (MAP_STYLES.find((s) => s.id === selectedStyleId)?.url ??
      MAP_STYLES[0]!.url);

  return (
    <Map
      key={mapStyleUrl}
      mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={viewState}
      mapStyle={mapStyleUrl}
      style={{ width: "100%", height: "100%", borderRadius: "12px" }}
      onMove={(e) => setViewState(e.viewState)}
    >
      <div className="absolute top-2 left-12 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm">
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {MAP_STYLES.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => {
                  setSyncTheme(false);
                  setSelectedStyleId(s.id);
                }}
              >
                {s.name}
                {!syncTheme && selectedStyleId === s.id ? (
                  <Check className="ml-auto h-4 w-4" />
                ) : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={syncTheme}
              onCheckedChange={(v) => setSyncTheme(Boolean(v))}
            >
              Sync with Theme
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NavigationControl position="top-right" />
      <GeolocateControl
        position="top-left"
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserLocation
      />
    </Map>
  );
}
