import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "@/trpc/server";
import AddListingButton from "./_components/add-listing-button";
import ListingsGrid from "./_components/listings-grid";

export default async function MyPlacesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const ownerId = session.user?.id ?? "";
  const listings = ownerId
    ? await api.listings.listByOwner({ ownerId })
    : [];

  return (
    <HydrateClient>
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">My Listings</h1>
          <AddListingButton />
        </div>

        <ListingsGrid listings={listings} />
      </div>
    </HydrateClient>
  );
}
