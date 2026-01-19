import { redirect } from "next/navigation";

export default function PortalPlansShim() {
  // For the fresh offline-first start, plans live as local templates in /train.
  redirect("/train/templates");
}

