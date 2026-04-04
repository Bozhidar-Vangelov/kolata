"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YearPicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { useMaintenance } from "@/hooks/use-maintenance";
import { MaintenancePageHeader } from "@/components/maintenance/page-header";
import { FormActions } from "@/components/maintenance/form-actions";
import { RecordList } from "@/components/maintenance/record-list";
import { validateYear, hasErrors } from "@/lib/validation";
import type { Database } from "@/types/database";

type Tires = Database["public"]["Tables"]["tires"]["Row"];

export default function TiresPage() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const [season, setSeason] = useState<"winter" | "summer" | "all_season">("summer");
  const [year, setYear] = useState<string>(String(currentYear));

  const m = useMaintenance<Tires>({
    table: "tires",
    orderBy: "created_at",
    onOpenAdd: () => { setSeason("summer"); setYear(String(currentYear)); },
    onOpenEdit: (r) => { setSeason(r.season); setYear(r.year ? String(r.year) : String(currentYear)); },
  });

  const seasonLabels: Record<string, string> = {
    winter: t("tires.winter"),
    summer: t("tires.summer"),
    all_season: t("tires.allSeason"),
  };

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    const year = validateYear(fd.get("year") as string, errs, t, { min: 2000, required: true });

    if (hasErrors(errs)) { m.setErrors(errs); return; }

    await m.submitRecord({
      car_id: m.carId,
      season,
      year,
      brand: (fd.get("brand") as string) || null,
    });
  }

  return (
    <div className="p-4 space-y-4">
      <MaintenancePageHeader carId={m.carId} title={t("tires.title")} onAdd={m.openAdd} />

      {m.showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label>{t("tires.title")}</Label>
                <Select value={season} onValueChange={(v) => { if (v) setSeason(v as "winter" | "summer" | "all_season"); }}>
                  <SelectTrigger>
                    <SelectValue>{seasonLabels[season]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winter">{t("tires.winter")}</SelectItem>
                    <SelectItem value="summer">{t("tires.summer")}</SelectItem>
                    <SelectItem value="all_season">{t("tires.allSeason")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("tires.year")} *</Label>
                  <YearPicker name="year" defaultValue={year} onValueChange={setYear} />
                  <FieldError error={m.errors.year} />
                </div>
                <div className="space-y-2">
                  <Label>{t("tires.brand")}</Label>
                  <Input name="brand" maxLength={30} defaultValue={m.editing?.brand ?? ""} />
                </div>
              </div>
              <FormActions loading={m.loading} onCancel={m.closeForm} />
            </form>
          </CardContent>
        </Card>
      )}

      <RecordList
        records={m.records}
        onDelete={m.handleDelete}
        onEdit={m.openEdit}
        renderDetails={(r) => (
          <div className="text-sm space-y-1">
            <p className="font-semibold">{seasonLabels[r.season]}</p>
            <p className="text-muted-foreground">
              {r.brand && <span>{r.brand}</span>}
              {r.brand && r.year && <span> • </span>}
              {r.year && <span>{r.year}</span>}
            </p>
          </div>
        )}
      />
    </div>
  );
}
