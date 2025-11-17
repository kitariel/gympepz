import ListingCard from "./listing-card";

type Listing = {
  id: string;
  title: string;
  category: string;
  address: string;
  imageUrls?: string[] | null;
};

export default function ListingsGrid({ listings }: { listings: Listing[] }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border p-6 text-sm">
        No listings yet. Click Add Listing to create your first place.
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard
          key={l.id}
          id={l.id}
          title={l.title}
          category={l.category}
          address={l.address}
          imageUrls={l.imageUrls}
        />
      ))}
    </div>
  );
}