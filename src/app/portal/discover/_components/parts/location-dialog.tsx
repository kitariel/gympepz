"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LocationDialog({
  open,
  onOpenChange,
  country,
  region,
  saving,
  onSelectCountryPhilippines,
  onSelectCountryOther,
  onCountryInputChange,
  onSelectRegion,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  region: string;
  saving: boolean;
  onSelectCountryPhilippines: () => void;
  onSelectCountryOther: () => void;
  onCountryInputChange: (value: string) => void;
  onSelectRegion: (value: string) => void;
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
          <div className="space-y-2">
            <Label>Country</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={country.toLowerCase() === "philippines" ? "default" : "outline"}
                onClick={onSelectCountryPhilippines}
              >
                Philippines
              </Button>
              <Button
                type="button"
                variant={country && country.toLowerCase() !== "philippines" ? "default" : "outline"}
                onClick={onSelectCountryOther}
              >
                Other
              </Button>
            </div>
            {country.toLowerCase() !== "philippines" && (
              <div className="mt-2">
                <Label htmlFor="country-other">Specify country</Label>
                <Input
                  id="country-other"
                  type="text"
                  value={country}
                  onChange={(e) => onCountryInputChange(e.target.value)}
                  placeholder="Your country"
                />
              </div>
            )}
          </div>

          {country.toLowerCase() === "philippines" && (
            <div className="space-y-2">
              <Label>Region</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "luzon", label: "Luzon" },
                  { key: "visayas", label: "Visayas" },
                  { key: "mindanao", label: "Mindanao" },
                ].map((r) => (
                  <Button
                    key={r.key}
                    type="button"
                    variant={region.toLowerCase() === r.label.toLowerCase() ? "default" : "outline"}
                    onClick={() => onSelectRegion(r.label)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

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