"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "@/env";
import Map, { NavigationControl } from "react-map-gl/mapbox";

export function DiscoverMap({ className }: { className?: string }) {
  if (!env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return <div className={className}>Missing Mapbox access token</div>;
  }

  return (
    <Map
      mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}
      initialViewState={{ longitude: 0, latitude: 0, zoom: 2 }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{ width: "100%", height: "100%", borderRadius: "12px" }}
    >
      <NavigationControl position="top-right" />
    </Map>
  );
}
