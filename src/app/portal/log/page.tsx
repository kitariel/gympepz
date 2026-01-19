import { redirect } from "next/navigation";

export default function PortalLogShim() {
  redirect("/train/history");
}

