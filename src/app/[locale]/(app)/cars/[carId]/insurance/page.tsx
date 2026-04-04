"use client";

import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { useMaintenance } from "@/hooks/use-maintenance";
import { MaintenancePageHeader } from "@/components/maintenance/page-header";
import { NotificationToggles } from "@/components/maintenance/notification-toggles";
import { FormActions } from "@/components/maintenance/form-actions";
import { RecordList, formatDate, formatPrice } from "@/components/maintenance/record-list";
import { validateRequired, validateDateRange, validatePrice, validateMaxLength, hasErrors } from "@/lib/validation";
import type { Database } from "@/types/database";

type Insurance = Database["public"]["Tables"]["insurance"]["Row"];

export default function InsurancePage() {
  const t = useTranslations();
  const m = useMaintenance<Insurance>({ table: "insurance", orderBy: "end_date" });

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    const company = (fd.get("company") as string).trim();
    const startDate = fd.get("start_date") as string;
    const endDate = fd.get("end_date") as string;

    validateRequired(company, "company", errs, t);
    validateMaxLength(company, "company", 50, errs, t);
    validateDateRange(startDate, endDate, errs, t);
    const price = validatePrice(fd.get("price"), errs, t);

    if (hasErrors(errs)) { m.setErrors(errs); return; }

    await m.submitRecord({
      car_id: m.carId,
      company,
      start_date: startDate,
      end_date: endDate,
      price,
      notify_10_days: fd.get("notify_10_days") === "on",
      notify_5_days: fd.get("notify_5_days") === "on",
      notify_1_day: fd.get("notify_1_day") === "on",
    });
  }

  return (
    <div className="p-4 space-y-4">
      <MaintenancePageHeader carId={m.carId} title={t("insurance.title")} onAdd={m.openAdd} />

      {m.showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label>{t("insurance.company")}</Label>
                <Input name="company" maxLength={50} defaultValue={m.editing?.company ?? ""} />
                <FieldError error={m.errors.company} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.startDate")}</Label>
                  <DatePicker name="start_date" defaultValue={m.editing?.start_date ?? ""} />
                  <FieldError error={m.errors.start_date} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.endDate")}</Label>
                  <DatePicker name="end_date" defaultValue={m.editing?.end_date ?? ""} />
                  <FieldError error={m.errors.end_date} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.price")}</Label>
                <Input name="price" type="number" step="0.01" defaultValue={m.editing?.price ?? ""} />
                <FieldError error={m.errors.price} />
              </div>
              <NotificationToggles defaults={m.editing} />
              <FormActions loading={m.loading} onCancel={m.closeForm} />
            </form>
          </CardContent>
        </Card>
      )}

      <RecordList
        records={m.records}
        endDateKey="end_date"
        onDelete={m.handleDelete}
        onEdit={m.openEdit}
        renderDetails={(r) => (
          <div className="text-sm space-y-1">
            <p className="font-semibold">{r.company}</p>
            <p className="text-muted-foreground">
              {formatDate(r.start_date)} — {formatDate(r.end_date)}
            </p>
            <p>{formatPrice(r.price)} {t("common.currency")}</p>
          </div>
        )}
      />
    </div>
  );
}
