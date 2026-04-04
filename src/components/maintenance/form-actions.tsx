"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function FormActions({
  loading,
  onCancel,
}: {
  loading: boolean;
  onCancel: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex gap-3">
      <Button type="submit" disabled={loading}>
        {loading ? t("common.loading") : t("common.save")}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        {t("common.cancel")}
      </Button>
    </div>
  );
}
