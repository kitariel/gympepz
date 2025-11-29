"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DiscoverMap } from "./_components/map";
import { api } from "@/trpc/react";
import { LocationDialog } from "./_components/parts/location-dialog";

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

  const locationInitialView = useMemo(() => {
    const loc = locQuery.data;
    const c = (loc?.country ?? "").toLowerCase();
    const r = (loc?.region ?? "").toLowerCase();
    if (!c) return undefined;
    if (c === "philippines") {
      if (r === "luzon") return { longitude: 121.0, latitude: 16.5, zoom: 6.5 };
      if (r === "visayas")
        return { longitude: 123.9, latitude: 10.3, zoom: 7.5 };
      if (r === "mindanao")
        return { longitude: 125.0, latitude: 7.5, zoom: 6.8 };
      return { longitude: 121.774, latitude: 12.8797, zoom: 5.5 };
    }
    return undefined;
  }, [locQuery.data]);

  return (
    <div className="h-[calc(103vh-5rem)] w-full p-3">
      <DiscoverMap
        className="h-full w-full"
        initialView={locationInitialView}
        enableGeolocate={locQuery.status === "success" && !locationInitialView}
        locationLabel={hasLocation ? `Location: ${displayCountry}${displayRegion ? ` • ${displayRegion}` : ""}` : undefined}
        onLocationClick={() => setDialogOpen(true)}
      />

      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        country={country}
        region={region}
        saving={saving}
        onSelectCountryPhilippines={() => setCountry("philippines")}
        onSelectCountryOther={() => setCountry("")}
        onCountryInputChange={(v) => setCountry(v)}
        onSelectRegion={(v) => setRegion(v)}
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
