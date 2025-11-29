"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/env";
import Map, { NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  MapStyleMenuOverlay,
  type MapStyle,
} from "./parts/map-style-menu-overlay";
import { LocationPillOverlay } from "./parts/location-pill-overlay";

export function DiscoverMap({
  className,
  initialView,
  enableGeolocate = true,
  locationLabel,
  onLocationClick,
}: {
  className?: string;
  initialView?: { longitude: number; latitude: number; zoom: number };
  enableGeolocate?: boolean;
  locationLabel?: string;
  onLocationClick?: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const [viewState, setViewState] = useState(
    initialView ?? {
      longitude: 0,
      latitude: 0,
      zoom: 2,
    },
  );

  useEffect(() => {
    if (initialView) {
      setViewState(initialView);
    }
  }, [initialView]);
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
  console.log("viewStateviewStateviewStateviewState", viewState);
  return (
    <Map
      key={mapStyleUrl}
      mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={viewState}
      mapStyle={mapStyleUrl}
      style={{ width: "100%", height: "100%", borderRadius: "12px" }}
      onMove={(e) => setViewState(e.viewState)}
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
