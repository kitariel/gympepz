import { redirect } from "next/navigation";

export default function PortalPlanDetailShim() {
  // Legacy route shim: the new "start from scratch" flow uses /train templates.
  redirect("/train/overview");
}

