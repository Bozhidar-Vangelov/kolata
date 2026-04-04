"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { addYears, format, parseISO } from "date-fns";
import { RecordList, formatDate, formatPrice } from "@/components/maintenance/record-list";
import type { Database } from "@/types/database";

type OilChange = Database["public"]["Tables"]["oil_change"]["Row"];

function computeNextChangeDate(changeDate: string): string {
  return format(addYears(parseISO(changeDate), 1), "yyyy-MM-dd");
}

export default function OilChangePage() {
  const t = useTranslations();
  const params = useParams();
  const carId = params.carId as string;
  const [records, setRecords] = useState<OilChange[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OilChange | null>(null);
  const [loading, setLoading] = useState(false);
  const [changeDate, setChangeDate] = useState("");

  const nextChangeDate = changeDate ? computeNextChangeDate(changeDate) : "";

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("oil_change")
      .select("*")
      .eq("car_id", carId)
      .order("change_date", { ascending: false });
    setRecords(data ?? []);
  }, [carId]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setChangeDate("");
    setShowForm(true);
  }

  function openEdit(record: OilChange) {
    setEditing(record);
    setChangeDate(record.change_date);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setChangeDate("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      car_id: carId,
      change_date: fd.get("change_date") as string,
      current_km: Number(fd.get("current_km")),
      next_change_km: Number(fd.get("next_change_km")),
      oil_type: fd.get("oil_type") as string,
      price: Number(fd.get("price")),
    };

    if (editing) {
      await supabase.from("oil_change").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("oil_change").insert(payload);
    }

    setLoading(false);
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const supabase = createClient();
    await supabase.from("oil_change").delete().eq("id", id);
    load();
  }

  return (
    <div className="p-4 space-y-4">
      <Link
        href={`/cars/${carId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("oilChange.title")}</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("oilChange.changeDate")}</Label>
                  <Input
                    name="change_date"
                    type="date"
                    required
                    value={changeDate}
                    onChange={(e) => setChangeDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("oilChange.nextChangeDate")}</Label>
                  <Input
                    type="date"
                    value={nextChangeDate}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("oilChange.currentKm")}</Label>
                  <Input name="current_km" type="number" min="0" required defaultValue={editing?.current_km ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>{t("oilChange.nextChangeKm")}</Label>
                  <Input name="next_change_km" type="number" min="0" required defaultValue={editing?.next_change_km ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("oilChange.oilType")}</Label>
                <Input name="oil_type" required defaultValue={editing?.oil_type ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.price")}</Label>
                <Input name="price" type="number" step="0.01" min="0" required defaultValue={editing?.price ?? ""} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? t("common.loading") : t("common.save")}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <RecordList
        records={records}
        onDelete={handleDelete}
        onEdit={openEdit}
        renderDetails={(r) => (
          <div className="text-sm space-y-1">
            <p className="font-semibold">{r.oil_type}</p>
            <p className="text-muted-foreground">{formatDate(r.change_date)}</p>
            <p>
              {r.current_km.toLocaleString()} km → {r.next_change_km.toLocaleString()} km
            </p>
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
