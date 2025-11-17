import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AddListingButton() {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/portal/my-places/new/new">
        <Plus className="mr-1 h-4 w-4" />
        Add Listing
      </Link>
    </Button>
  );
}