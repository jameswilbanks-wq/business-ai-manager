import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { OnboardingView } from "@/features/identity/components/onboarding-view";

/**
 * Reused both for first-time setup (the (app) layout redirects here when a
 * person has zero businesses) and later for "add another business" from
 * the business switcher — so this page itself doesn't force people away
 * just because they already belong to one.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <OnboardingView />;
}
