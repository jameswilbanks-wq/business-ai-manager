import { getDashboardSummary } from "@/features/dashboard/api/get-dashboard-summary";
import { getCurrentUser } from "@/features/identity/api/get-current-user";
import { getCurrentBusiness } from "@/features/identity/api/get-current-business";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export default async function DashboardPage() {
  const [summary, user, currentBusiness] = await Promise.all([
    getDashboardSummary(),
    getCurrentUser(),
    getCurrentBusiness(),
  ]);

  const userName = user?.profile?.displayName ?? user?.email?.split("@")[0] ?? "";

  return (
    <DashboardView
      summary={summary}
      userName={userName}
      businessName={currentBusiness?.business.name ?? ""}
    />
  );
}
