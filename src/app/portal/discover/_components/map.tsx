"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/env";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  MapStyleMenuOverlay,
  type MapStyle,
} from "./parts/map-style-menu-overlay";
import { LocationPillOverlay } from "./parts/location-pill-overlay";

type View = { longitude: number; latitude: number; zoom: number };
function isView(v: unknown): v is View {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).longitude === "number" &&
    typeof (v as Record<string, unknown>).latitude === "number" &&
    typeof (v as Record<string, unknown>).zoom === "number"
  );
}

export function DiscoverMap({
  className,
  initialView,
  enableGeolocate = true,
  locationLabel,
  onLocationClick,
  initialBounds,
}: {
  className?: string;
  initialView?: { longitude: number; latitude: number; zoom: number };
  enableGeolocate?: boolean;
  locationLabel?: string;
  onLocationClick?: () => void;
  initialBounds?: [[number, number], [number, number]];
}) {
  const { resolvedTheme } = useTheme();
  const [viewState, setViewState] = useState(
    initialView ?? {
      longitude: 0,
      latitude: 0,
      zoom: 2,
    },
  );
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (initialView) {
      setViewState(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    const map = mapRef.current as { fitBounds: (b: [[number, number], [number, number]], opts?: unknown) => void } | null;
    if (map && initialBounds) {
      try {
        map.fitBounds(initialBounds, { padding: 40, duration: 500 });
      } catch {}
    }
  }, [initialBounds]);
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
      if (!initialView) {
        const savedView = localStorage.getItem(LS_VIEWSTATE_KEY);
        if (savedView) {
          const v: unknown = JSON.parse(savedView);
          if (isView(v)) {
            setViewState(v);
          }
        }
      }
    } catch {}
  }, [initialView]);

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
    if (!initialView && enableGeolocate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setViewState({ latitude, longitude, zoom: 14 });
        },
        () => {
          /* empty */
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, [initialView, enableGeolocate]);

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
      onLoad={(e) => {
        mapRef.current = e.target;
        if (initialBounds) {
          try {
            e.target.fitBounds(initialBounds, { padding: 40, duration: 500 });
          } catch {}
        }
      }}
    >
      <MapStyleMenuOverlay
        styles={MAP_STYLES}
        selectedStyleId={selectedStyleId}
        syncTheme={syncTheme}
        onSelectStyle={(id) => {
          setSyncTheme(false);
          setSelectedStyleId(id);
        }}
        onToggleSyncTheme={(v) => setSyncTheme(v)}
      />
      <LocationPillOverlay label={locationLabel} onClick={onLocationClick} />
      <NavigationControl position="top-right" />
      <GeolocateControl
        position="top-right"
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserLocation
      />
    </Map>
  );
}
