"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/uploadthing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
type GalleryItem = { id: string; url: string };

export function GalleryUploader({
  onAdd,
}: {
  onAdd: (urls: string[]) => void;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const galleryQuery = api.gallery.listByUser.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const addMany = api.gallery.addMany.useMutation();
  const [tab, setTab] = useState<"gallery" | "upload">("upload");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleSelect = (url: string) => {
    setSelected((prev) => ({ ...prev, [url]: !prev[url] }));
  };

  const selectedUrls = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([u]) => u);

  return (
    <Card className="p-3">
      <div className="mb-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={tab === "upload" ? "default" : "outline"}
          onClick={() => setTab("upload")}
        >
          Upload from computer
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "gallery" ? "default" : "outline"}
          onClick={() => setTab("gallery")}
        >
          My gallery
        </Button>
      </div>

      {tab === "upload" && (
        <div className="bg-muted/50 text-muted-foreground flex min-h-28 items-center justify-center rounded-md border border-dashed">
          <UploadDropzone
            endpoint="listingImages"
            onClientUploadComplete={async (res) => {
              const urls = (Array.isArray(res) ? res : [])
                .map((r) =>
                  (r.serverData?.url ?? r.url ?? "")
                    .trim()
                    .replace(/[)]+$/g, ""),
                )
                .filter((u) => !!u);
              if (urls.length > 0) {
                onAdd(urls);
                if (userId) await addMany.mutateAsync({ userId, urls });
                await galleryQuery.refetch();
              }
            }}
            onUploadError={(error: Error) => alert(error.message)}
            className="w-full"
          />
        </div>
      )}

      {tab === "gallery" && (
        <div className="grid grid-cols-5 gap-2">
          {(galleryQuery.data ?? []).map((g: GalleryItem) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleSelect(g.url)}
              className={`relative h-20 w-full overflow-hidden rounded border ${selected[g.url] ? "border-primary" : "border-transparent"}`}
            >
              <Image src={g.url} alt="gallery" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {tab === "gallery" && (
        <div className="mt-3 flex items-center justify-between">
          <Label className="text-xs">Selected: {selectedUrls.length}</Label>
          <Button
            type="button"
            size="sm"
            disabled={selectedUrls.length === 0}
            onClick={() => {
              if (selectedUrls.length > 0) {
                onAdd(selectedUrls);
                setSelected({});
              }
            }}
          >
            Add selected
          </Button>
        </div>
      )}
    </Card>
  );
}
