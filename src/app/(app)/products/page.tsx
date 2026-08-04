"use client";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { useLocale } from "@/providers/locale-provider";

export default function DomainPlaceholderPage() {
  const { t } = useLocale();
  return (
    <ModulePlaceholder
      title={`${t.nav.products} — ${t.module.coming_soon_title}`}
      description={t.module.coming_soon_description}
    />
  );
}
