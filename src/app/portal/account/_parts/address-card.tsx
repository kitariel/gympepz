"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <Card className="bg-card text-card-foreground from-primary to-primary/80 rounded-xl border border-none shadow-sm">
      <CardHeader className="border-b py-4">
        <div>
          <div className="text-sm font-semibold">Address</div>
          <div className="text-muted-foreground text-xs">
            Where you usually train
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-card-foreground rounded-b-xl pb-4">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!email || !country) return;
            await upsertLocation.mutateAsync({ email, country, region });
          }}
        >
          <div className="grid gap-2">
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
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="region" className="text-xs font-medium">
              City / region
            </label>
            <Input
              id="region"
              placeholder="City or region"
              value={region}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRegion(e.target.value)
              }
            />
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              type="submit"
              disabled={upsertLocation.isPending}
              aria-busy={upsertLocation.isPending}
            >
              {upsertLocation.isPending ? "Saving..." : "Save address"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
