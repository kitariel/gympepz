import { redirect } from "next/navigation";

export default function PortalStartShim() {
  redirect("/train/log");
}

