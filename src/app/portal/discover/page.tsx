"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DiscoverMap } from "./_components/map";
import { api } from "@/trpc/react";
import { LocationDialog } from "./_components/parts/location-dialog";
import { env } from "@/env";

type View = { longitude: number; latitude: number; zoom: number };
type Bounds = [[number, number], [number, number]];
type GeocodeFeature = {
  center?: [number, number];
  bbox?: [number, number, number, number];
  properties?: { short_code?: string };
};
type MapboxResponse = { features?: GeocodeFeature[] };

export default function DiscoverPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const locQuery = api.location.getByUserEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const utils = api.useUtils();
  const upsertLoc = api.location.upsertByUserEmail.useMutation({
    onSuccess: async () => {
      await utils.location.getByUserEmail.invalidate({ email });
      setDialogOpen(false);
    },
  });

  const hasLocation = useMemo(() => {
    const loc = locQuery.data;
    return !!loc?.country;
  }, [locQuery.data]);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [country, setCountry] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [regionScope, setRegionScope] = useState<
    "province_state" | "city_town"
  >("province_state");

  useEffect(() => {
    if (locQuery.status === "success") {
      const loc = locQuery.data;
      if (!loc?.country) {
        setDialogOpen(true);
        setCountry("philippines");
        setRegion("visayas");
      } else {
        setDialogOpen(false);
        setCountry(loc.country ?? "");
        setRegion(loc.region ?? "");
      }
    }
  }, [locQuery.status, locQuery.data]);

  const saving = upsertLoc.isPending;

  const displayCountry =
    (country || "").toLowerCase() === "philippines"
      ? "Philippines"
      : country || "";
  const displayRegion = region || "";

  const [locationInitialView, setLocationInitialView] = useState<
    View | undefined
  >(undefined);
  const [locationInitialBounds, setLocationInitialBounds] = useState<
    Bounds | undefined
  >(undefined);
  useEffect(() => {
    const token = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const run = async () => {
      const loc = locQuery.data;
      const countryName = (loc?.country ?? "").trim();
      const regionName = (loc?.region ?? "").trim();
      if (!countryName) {
        setLocationInitialView(undefined);
        return;
      }
      const countryUrl = new URL(
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
          encodeURIComponent(countryName) +
          ".json",
      );
      countryUrl.searchParams.set("types", "country");
      countryUrl.searchParams.set("limit", "1");
      countryUrl.searchParams.set("access_token", token ?? "");
      try {
        const cRes = await fetch(countryUrl.toString());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cData: MapboxResponse = await cRes.json();
        const cFeat = cData.features?.[0];
        const countryCode = cFeat?.properties?.short_code;
        const cCenter = cFeat?.center;
        const cBbox = cFeat?.bbox;
        if (regionName && countryCode) {
          const regionUrl = new URL(
            "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
              encodeURIComponent(regionName) +
              ".json",
          );
          regionUrl.searchParams.set(
            "types",
            regionScope === "province_state"
              ? "region,district"
              : "place,locality",
          );
          regionUrl.searchParams.set("country", countryCode);
          regionUrl.searchParams.set("limit", "1");
          regionUrl.searchParams.set("access_token", token ?? "");
          const rRes = await fetch(regionUrl.toString());
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const rData: MapboxResponse = await rRes.json();
          const rFeat = rData.features?.[0];
          const rCenter = rFeat?.center;
          const rBbox = rFeat?.bbox;
          if (rCenter?.length === 2) {
            setLocationInitialView({
              longitude: rCenter[0],
              latitude: rCenter[1],
              zoom: 6.5,
            });
            if (rBbox?.length === 4) {
              setLocationInitialBounds([
                [rBbox[0], rBbox[1]],
                [rBbox[2], rBbox[3]],
              ]);
            } else {
              setLocationInitialBounds(undefined);
            }
            return;
          }
        }
        if (cCenter?.length === 2) {
          setLocationInitialView({
            longitude: cCenter[0],
            latitude: cCenter[1],
            zoom: 5.5,
          });
          if (cBbox?.length === 4) {
            setLocationInitialBounds([
              [cBbox[0], cBbox[1]],
              [cBbox[2], cBbox[3]],
            ]);
          } else {
            setLocationInitialBounds(undefined);
          }
        } else {
          setLocationInitialView(undefined);
          setLocationInitialBounds(undefined);
        }
      } catch {
        setLocationInitialView(undefined);
        setLocationInitialBounds(undefined);
      }
    };
    if (locQuery.status === "success") void run();
  }, [locQuery.status, locQuery.data, regionScope]);

  return (
    <div className="h-[calc(103vh-5rem)] w-full p-3">
      <DiscoverMap
        className="h-full w-full"
        initialView={locationInitialView}
        initialBounds={locationInitialBounds}
        enableGeolocate={locQuery.status === "success" && !locationInitialView}
        locationLabel={
          hasLocation
            ? `Location: ${displayCountry}${displayRegion ? ` • ${displayRegion}` : ""}`
            : undefined
        }
        onLocationClick={() => setDialogOpen(true)}
      />

      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        country={country}
        region={region}
        regionScope={regionScope}
        saving={saving}
        onSelectCountryPhilippines={() => setCountry("philippines")}
        onSelectCountryOther={() => setCountry("")}
        onCountryInputChange={(v) => setCountry(v)}
        onSelectRegion={(v) => setRegion(v)}
        onRegionScopeChange={(v) => setRegionScope(v)}
        onSave={() => {
          const payload = {
            email,
            country: country.trim(),
            region:
              country.toLowerCase() === "philippines"
                ? region.trim() || "visayas"
                : undefined,
          };
          upsertLoc.mutate(payload);
        }}
      />
    </div>
  );
}
