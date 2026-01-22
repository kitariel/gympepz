"use client";

import { ProfileHeader } from "./profile-header";
import { AccountDetailsCard } from "./account-details-card";
import { ProfileCard } from "./profile-card";
import { AddressCard } from "./address-card";
import { SecurityCard } from "./security-card";
import { PlanBillingCard } from "./plan-billing-card";
import { PreferencesCard } from "./preferences-card";
import { SyncCard } from "./sync-card";
import { DangerZoneCard } from "./danger-zone-card";

type AccountUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  hasPassword?: boolean;
  emailVerified?: Date | null;
  status?: string | null;
  createdAt?: Date | null;
};

export default function AccountForm({
  initialUser,
  email,
  userId,
}: {
  initialUser: AccountUser | null;
  email: string;
  userId: string;
}) {
  return (
    <div className="space-y-4">
      <ProfileHeader initialUser={initialUser} email={email} />
      <AccountDetailsCard user={initialUser} email={email} />
      <ProfileCard user={initialUser} email={email} />
      <AddressCard email={email} />
      <SecurityCard userId={userId} user={initialUser} />
      <PlanBillingCard userId={userId} />
      <SyncCard />
      <PreferencesCard />
      <DangerZoneCard />
    </div>
  );
}
