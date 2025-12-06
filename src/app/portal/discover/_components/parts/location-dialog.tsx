"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CountryRegionSearch } from "./country-region-search";

export function LocationDialog({
  open,
  onOpenChange,
  country,
  region,
  regionScope,
  saving,
  onSelectCountryPhilippines,
  onSelectCountryOther,
  onCountryInputChange,
  onSelectRegion,
  onRegionScopeChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  region: string;
  regionScope: "province_state" | "city_town";
  saving: boolean;
  onSelectCountryPhilippines: () => void;
  onSelectCountryOther: () => void;
  onCountryInputChange: (value: string) => void;
  onSelectRegion: (value: string) => void;
  onRegionScopeChange: (value: "province_state" | "city_town") => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select your location</DialogTitle>
          <DialogDescription>
            Choose country and region to personalize Discover.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <CountryRegionSearch
            country={country}
            region={region}
            regionScope={regionScope}
            onCountryChange={onCountryInputChange}
            onRegionChange={onSelectRegion}
            onRegionScopeChange={onRegionScopeChange}
          />

          <div className="pt-2">
            <Button
              type="button"
              className="w-full"
              disabled={saving || !country}
              onClick={onSave}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
