"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";

type ListingCardProps = {
  id: string;
  title: string;
  category: string;
  address: string;
  imageUrls?: string[] | null;
};

export default function ListingCard({ id, title, category, address, imageUrls }: ListingCardProps) {
  const cover = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls[0] : undefined;
  return (
    <Card className="overflow-hidden">
      <Link href={`/place/${id}`} className="block">
        {cover ? (
          <div className="relative h-36 w-full">
            <Image src={cover} alt={title} fill className="object-cover" />
          </div>
        ) : (
          <div className="bg-muted h-36 w-full" />
        )}
        <div className="p-3">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{category}</div>
          <div className="mt-1 text-xs">{address}</div>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/portal/my-places/new/${id}`}>Edit</Link>
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}