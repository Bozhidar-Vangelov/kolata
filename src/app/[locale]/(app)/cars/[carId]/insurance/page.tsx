"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { RecordList, formatDate, formatPrice } from "@/components/maintenance/record-list";
import type { Database } from "@/types/database";

type Insurance = Database["public"]["Tables"]["insurance"]["Row"];

export default function InsurancePage() {
  const t = useTranslations();
  const params = useParams();
  const carId = params.carId as string;
  const [records, setRecords] = useState<Insurance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("insurance")
      .select("*")
      .eq("car_id", carId)
      .order("end_date", { ascending: false });
    setRecords(data ?? []);
  }, [carId]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(record: Insurance) {
    setEditing(record);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      car_id: carId,
      company: fd.get("company") as string,
      start_date: fd.get("start_date") as string,
      end_date: fd.get("end_date") as string,
      price: Number(fd.get("price")),
      notify_10_days: fd.get("notify_10_days") === "on",
      notify_5_days: fd.get("notify_5_days") === "on",
      notify_1_day: fd.get("notify_1_day") === "on",
    };

    if (editing) {
      await supabase.from("insurance").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("insurance").insert(payload);
    }

    setLoading(false);
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const supabase = createClient();
    await supabase.from("insurance").delete().eq("id", id);
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
        <h1 className="text-2xl font-bold">{t("insurance.title")}</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("insurance.company")}</Label>
                <Input name="company" required defaultValue={editing?.company ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.startDate")}</Label>
                  <Input name="start_date" type="date" required defaultValue={editing?.start_date ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.endDate")}</Label>
                  <Input name="end_date" type="date" required defaultValue={editing?.end_date ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("common.price")}</Label>
                <Input name="price" type="number" step="0.01" min="0" required defaultValue={editing?.price ?? ""} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch name="notify_10_days" defaultChecked={editing?.notify_10_days ?? true} />
                  <Label>{t("notifications.notify10Days")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch name="notify_5_days" defaultChecked={editing?.notify_5_days ?? true} />
                  <Label>{t("notifications.notify5Days")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch name="notify_1_day" defaultChecked={editing?.notify_1_day ?? true} />
                  <Label>{t("notifications.notify1Day")}</Label>
                </div>
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
        endDateKey="end_date"
        onDelete={handleDelete}
        onEdit={openEdit}
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
