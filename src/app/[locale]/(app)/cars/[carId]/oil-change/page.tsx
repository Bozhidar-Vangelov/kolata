"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field-error";
import { useMaintenance } from "@/hooks/use-maintenance";
import { MaintenancePageHeader } from "@/components/maintenance/page-header";
import { FormActions } from "@/components/maintenance/form-actions";
import {
  RecordList,
  formatDate,
  formatPrice,
} from "@/components/maintenance/record-list";
import {
  validateDate,
  validateRequired,
  validatePrice,
  validateKm,
  validateMaxLength,
  hasErrors,
} from "@/lib/validation";
import { addYears, format, parseISO } from "date-fns";
import type { Database } from "@/types/database";

type OilChange = Database["public"]["Tables"]["oil_change"]["Row"];

function computeNextChangeDate(changeDate: string): string {
  return format(addYears(parseISO(changeDate), 1), "yyyy-MM-dd");
}

const OIL_TYPE_MAX_LENGTH = 30;

const FILTER_KEYS = [
  "filter_oil",
  "filter_air",
  "filter_cabin",
  "filter_fuel",
] as const;

const FILTER_LABEL_KEYS: Record<(typeof FILTER_KEYS)[number], string> = {
  filter_oil: "oilChange.filterOil",
  filter_air: "oilChange.filterAir",
  filter_cabin: "oilChange.filterCabin",
  filter_fuel: "oilChange.filterFuel",
};

const DEFAULT_FILTERS = {
  filter_oil: false,
  filter_air: false,
  filter_cabin: false,
  filter_fuel: false,
};

export default function OilChangePage() {
  const t = useTranslations();
  const [changeDate, setChangeDate] = useState("");
  const [filters, setFilters] =
    useState<Record<(typeof FILTER_KEYS)[number], boolean>>(DEFAULT_FILTERS);

  const m = useMaintenance<OilChange>({
    table: "oil_change",
    orderBy: "change_date",
    onOpenAdd: () => {
      setChangeDate("");
      setFilters({ ...DEFAULT_FILTERS });
    },
    onOpenEdit: (r) => {
      setChangeDate(r.change_date);
      setFilters({
        filter_oil: r.filter_oil,
        filter_air: r.filter_air,
        filter_cabin: r.filter_cabin,
        filter_fuel: r.filter_fuel,
      });
    },
    onCloseForm: () => {
      setChangeDate("");
      setFilters({ ...DEFAULT_FILTERS });
    },
  });

  const nextChangeDate = changeDate ? computeNextChangeDate(changeDate) : "";

  function toggleFilter(key: (typeof FILTER_KEYS)[number]) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    const changeDateVal = fd.get("change_date") as string;
    const oilType = (fd.get("oil_type") as string).trim();

    validateDate(changeDateVal, "change_date", errs, t);
    const { currentKm, nextChangeKm } = validateKm(
      fd.get("current_km"),
      fd.get("next_change_km"),
      errs,
      t
    );
    validateRequired(oilType, "oil_type", errs, t);
    validateMaxLength(oilType, "oil_type", OIL_TYPE_MAX_LENGTH, errs, t);
    const price = validatePrice(fd.get("price"), errs, t);

    if (hasErrors(errs)) {
      m.setErrors(errs);
      return;
    }

    await m.submitRecord({
      car_id: m.carId,
      change_date: changeDateVal,
      current_km: currentKm,
      next_change_km: nextChangeKm,
      oil_type: oilType,
      price,
      ...filters,
    });
  }

  const activeFilters = (r: OilChange) => FILTER_KEYS.filter((key) => r[key]);

  return (
    <div className="p-4 space-y-4">
      <MaintenancePageHeader
        carId={m.carId}
        title={t("oilChange.title")}
        onAdd={m.openAdd}
      />

      {m.showForm && (
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("oilChange.changeDate")}</Label>
                  <DatePicker
                    name="change_date"
                    value={changeDate}
                    onValueChange={setChangeDate}
                  />
                  <FieldError error={m.errors.change_date} />
                </div>
                <div className="space-y-2">
                  <Label>{t("oilChange.nextChangeDate")}</Label>
                  <DatePicker
                    value={nextChangeDate}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("oilChange.currentKm")}</Label>
                  <Input
                    name="current_km"
                    type="number"
                    defaultValue={m.editing?.current_km ?? ""}
                  />
                  <FieldError error={m.errors.current_km} />
                </div>
                <div className="space-y-2">
                  <Label>{t("oilChange.nextChangeKm")}</Label>
                  <Input
                    name="next_change_km"
                    type="number"
                    defaultValue={m.editing?.next_change_km ?? ""}
                  />
                  <FieldError error={m.errors.next_change_km} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("oilChange.oilType")}</Label>
                <Input
                  name="oil_type"
                  maxLength={OIL_TYPE_MAX_LENGTH}
                  defaultValue={m.editing?.oil_type ?? ""}
                />
                <FieldError error={m.errors.oil_type} />
              </div>
              <div className="space-y-2">
                <Label>{t("oilChange.filters")}</Label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFilter(key)}
                    >
                      <Badge
                        variant={filters[key] ? "default" : "outline"}
                        className="cursor-pointer text-sm px-3 py-1 h-auto"
                      >
                        {t(FILTER_LABEL_KEYS[key])}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.price")}</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={m.editing?.price ?? ""}
                />
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
            <p>
              {r.current_km.toLocaleString()} km →{" "}
              {r.next_change_km.toLocaleString()} km
            </p>
            <p className="text-muted-foreground">
              {t("oilChange.nextChangeDate")}:{" "}
              {formatDate(computeNextChangeDate(r.change_date))}
            </p>
            {activeFilters(r).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {activeFilters(r).map((key) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {t(FILTER_LABEL_KEYS[key])}
                  </Badge>
                ))}
              </div>
            )}
            <p>
              {formatPrice(r.price)} {t("common.currency")}
            </p>
          </div>
        )}
      />
    </div>
  );
}
