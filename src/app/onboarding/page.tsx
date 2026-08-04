import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { getUserBusinesses } from "@/features/identity/api/get-user-businesses";
import { OnboardingView } from "@/features/identity/components/onboarding-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Reused both for first-time setup ((app)/layout.tsx redirects here when a
 * person has zero businesses) and later for "add another business" from
 * the switcher. When the person already has a business, a "back to
 * dashboard" link appears — first-time visitors have nowhere to skip to,
 * so it's intentionally hidden for them.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await getUserBusinesses();

  return <OnboardingView hasExistingBusiness={memberships.length > 0} />;
}
