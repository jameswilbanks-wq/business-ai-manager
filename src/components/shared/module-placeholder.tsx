import { Construction } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * Temporary landing for a domain route whose module has not been built yet.
 * Every primary nav destination must resolve to *something* per the M1
 * shell requirement, even before that module's milestone starts. Replaced
 * entirely once the corresponding feature milestone ships.
 */
export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState icon={<Construction />} title={title} description={description} />
    </div>
  );
}
