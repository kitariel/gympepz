"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function AddressCard({ email }: { email: string }) {
  const [country, setCountry] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  const utils = api.useUtils();
  const locationQuery = api.location.getByUserEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const upsertLocation = api.location.upsertByUserEmail.useMutation({
    onSuccess: () => {
      void utils.location.getByUserEmail.invalidate({ email });
    },
  });

  useEffect(() => {
    if (locationQuery.data) {
      setCountry(locationQuery.data.country ?? "");
      setRegion(locationQuery.data.region ?? "");
    }
  }, [locationQuery.data]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" />
          Address
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Where you usually train
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!email || !country) return;
            await upsertLocation.mutateAsync({ email, country, region });
          }}
        >
          <div className="grid gap-1.5">
            <label htmlFor="country" className="text-xs font-medium">
              Country
            </label>
            <Input
              id="country"
              placeholder="Country"
              value={country}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCountry(e.target.value)
              }
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="region" className="text-xs font-medium">
              City / Region
            </label>
            <Input
              id="region"
              placeholder="City or region"
              value={region}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRegion(e.target.value)
              }
              className="h-9"
            />
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              type="submit"
              size="sm"
              disabled={upsertLocation.isPending}
              aria-busy={upsertLocation.isPending}
              className="h-9"
            >
              {upsertLocation.isPending ? "Saving..." : "Save address"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
