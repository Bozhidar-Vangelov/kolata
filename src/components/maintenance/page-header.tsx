"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

export function MaintenancePageHeader({
  carId,
  title,
  onAdd,
}: {
  carId: string;
  title: string;
  onAdd: () => void;
}) {
  const t = useTranslations();

  return (
    <>
      <Link
        href={`/cars/${carId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>
    </>
  );
}
