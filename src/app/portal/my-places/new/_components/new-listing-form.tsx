"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/components/uploadthing";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import LocationPicker from "./location-picker";

export default function NewListingForm() {
  const router = useRouter();
  const params = useParams();
  const placeId = (params?.place_id as string) ?? "new";
  const isEdit = placeId !== "new";
  const createListing = api.listings.create.useMutation();
  const updateListing = api.listings.update.useMutation();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [shortDescription, setShortDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const listingQuery = api.listings.byId.useQuery(
    { id: placeId },
    { enabled: isEdit },
  );

  if (isEdit && listingQuery.data && title === "" && category === "" && address === "") {
    const l = listingQuery.data;
    setTitle(l?.title ?? "");
    setCategory(l?.category ?? "");
    setAddress(l?.address ?? "");
    setLatitude(l?.latitude ?? null);
    setLongitude(l?.longitude ?? null);
    setShortDescription(l?.shortDescription ?? "");
    setPhone(l?.phone ?? "");
    setWebsite(l?.website ?? "");
    setImageUrls(Array.isArray(l?.imageUrls) ? l.imageUrls : []);
  }

  return (
    <div className="p-3">
      <h1 className="mb-3 text-lg font-semibold">{isEdit ? "Edit Listing" : "Add Listing"}</h1>
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <LocationPicker
              latitude={latitude ?? undefined}
              longitude={longitude ?? undefined}
              onPick={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Short Description</Label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Website</Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Images</Label>
            <UploadButton
              endpoint="avatarUploader"
              onClientUploadComplete={(res) => {
                const first = Array.isArray(res) ? res[0] : undefined;
                const raw = first?.serverData?.url ?? first?.url;
                const url = (raw ?? "").trim().replace(/[)]+$/g, "");
                if (url) setImageUrls((prev) => [...prev, url]);
              }}
              onUploadError={(error: Error) => alert(error.message)}
            />
            {imageUrls.length > 0 && (
              <div className="flex gap-2">
                {imageUrls.map((u) => (
                  <div
                    key={u}
                    className="relative h-16 w-16 overflow-hidden rounded"
                  >
                    <Image
                      src={u}
                      alt="uploaded"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button
            disabled={createListing.isPending || updateListing.isPending}
            onClick={async () => {
              const lat = latitude;
              const lng = longitude;
              if (
                !title ||
                !category ||
                !address ||
                !Number.isFinite(lat ?? NaN) ||
                !Number.isFinite(lng ?? NaN)
              ) {
                alert(
                  "Please fill in title, category, address, latitude and longitude.",
                );
                return;
              }
              const ownerId = session?.user?.id;
              if (!ownerId) {
                alert("Not authenticated.");
                return;
              }
              let normalizedWebsite = website.trim();
              if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) {
                normalizedWebsite = `https://${normalizedWebsite}`;
              }
              try {
              if (isEdit) {
                await updateListing.mutateAsync({
                  id: placeId,
                  title,
                  category,
                  address,
                  latitude: lat!,
                  longitude: lng!,
                  shortDescription,
                  phone,
                  website: normalizedWebsite || undefined,
                  imageUrls,
                });
              } else {
                await createListing.mutateAsync({
                  ownerId,
                  title,
                  category,
                  address,
                  latitude: lat!,
                  longitude: lng!,
                  shortDescription,
                  phone,
                  website: normalizedWebsite || undefined,
                  imageUrls,
                });
              }
              router.replace("/portal/my-places");
              } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to save listing.";
                alert(message);
              }
            }}
          >
            {isEdit ? (updateListing.isPending ? "Updating..." : "Update Listing") : (createListing.isPending ? "Saving..." : "Save Listing")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
