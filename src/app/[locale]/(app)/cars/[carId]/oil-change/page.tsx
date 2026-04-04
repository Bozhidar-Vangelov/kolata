"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { useMaintenance } from "@/hooks/use-maintenance";
import { MaintenancePageHeader } from "@/components/maintenance/page-header";
import { FormActions } from "@/components/maintenance/form-actions";
import { RecordList, formatDate, formatPrice } from "@/components/maintenance/record-list";
import { validateDate, validateRequired, validatePrice, validateKm, hasErrors } from "@/lib/validation";
import { addYears, format, parseISO } from "date-fns";
import type { Database } from "@/types/database";

type OilChange = Database["public"]["Tables"]["oil_change"]["Row"];

function computeNextChangeDate(changeDate: string): string {
  return format(addYears(parseISO(changeDate), 1), "yyyy-MM-dd");
}

export default function OilChangePage() {
  const t = useTranslations();
  const [changeDate, setChangeDate] = useState("");

  const m = useMaintenance<OilChange>({
    table: "oil_change",
    orderBy: "change_date",
    onOpenAdd: () => setChangeDate(""),
    onOpenEdit: (r) => setChangeDate(r.change_date),
    onCloseForm: () => setChangeDate(""),
  });

  const nextChangeDate = changeDate ? computeNextChangeDate(changeDate) : "";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    const changeDateVal = fd.get("change_date") as string;
    const oilType = (fd.get("oil_type") as string).trim();

    validateDate(changeDateVal, "change_date", errs, t);
    const { currentKm, nextChangeKm } = validateKm(fd.get("current_km"), fd.get("next_change_km"), errs, t);
    validateRequired(oilType, "oil_type", errs, t);
    const price = validatePrice(fd.get("price"), errs, t);

    if (hasErrors(errs)) { m.setErrors(errs); return; }

    await m.submitRecord({
      car_id: m.carId,
      change_date: changeDateVal,
      current_km: currentKm,
      next_change_km: nextChangeKm,
      oil_type: oilType,
      price,
    });
  }

  return (
    <div className="p-4 space-y-4">
      <MaintenancePageHeader carId={m.carId} title={t("oilChange.title")} onAdd={m.openAdd} />

      {m.showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("oilChange.changeDate")}</Label>
                  <Input
                    name="change_date"
                    type="date"
                    value={changeDate}
                    onChange={(e) => setChangeDate(e.target.value)}
                  />
                  <FieldError error={m.errors.change_date} />
                </div>
                <div className="space-y-2">
                  <Label>{t("oilChange.nextChangeDate")}</Label>
                  <Input type="date" value={nextChangeDate} readOnly disabled className="bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("oilChange.currentKm")}</Label>
                  <Input name="current_km" type="number" defaultValue={m.editing?.current_km ?? ""} />
                  <FieldError error={m.errors.current_km} />
                </div>
                <div className="space-y-2">
                  <Label>{t("oilChange.nextChangeKm")}</Label>
                  <Input name="next_change_km" type="number" defaultValue={m.editing?.next_change_km ?? ""} />
                  <FieldError error={m.errors.next_change_km} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("oilChange.oilType")}</Label>
                <Input name="oil_type" defaultValue={m.editing?.oil_type ?? ""} />
                <FieldError error={m.errors.oil_type} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.price")}</Label>
                <Input name="price" type="number" step="0.01" defaultValue={m.editing?.price ?? ""} />
                <FieldError error={m.errors.price} />
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
            <p className="font-semibold">{r.oil_type}</p>
            <p className="text-muted-foreground">{formatDate(r.change_date)}</p>
            <p>{r.current_km.toLocaleString()} km → {r.next_change_km.toLocaleString()} km</p>
            <p className="text-muted-foreground">
              {t("oilChange.nextChangeDate")}: {formatDate(computeNextChangeDate(r.change_date))}
            </p>
            <p>{formatPrice(r.price)} {t("common.currency")}</p>
          </div>
        )}
      />
    </div>
  );
}
