import { getAnalytics } from "@/features/analytics/api/get-analytics";
import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { EmptyState } from "@/components/shared/empty-state";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  if (!data) {
    return (
      <EmptyState
        icon={<BarChart3 />}
        title="No hay datos suficientes todavía"
        description="La analítica aparecerá aquí una vez que existan pedidos y conversaciones."
        className="mt-10"
      />
    );
  }

  return <AnalyticsView data={data} />;
}
