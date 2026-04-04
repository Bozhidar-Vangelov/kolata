"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { RecordList } from "@/components/maintenance/record-list";
import type { Database } from "@/types/database";

type Tires = Database["public"]["Tables"]["tires"]["Row"];

export default function TiresPage() {
  const t = useTranslations();
  const params = useParams();
  const carId = params.carId as string;
  const [records, setRecords] = useState<Tires[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tires | null>(null);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState<"winter" | "summer" | "all_season">("summer");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tires")
      .select("*")
      .eq("car_id", carId)
      .order("created_at", { ascending: false });
    setRecords(data ?? []);
  }, [carId]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setSeason("summer");
    setShowForm(true);
  }

  function openEdit(record: Tires) {
    setEditing(record);
    setSeason(record.season);
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
      season,
      year: fd.get("year") ? Number(fd.get("year")) : null,
      brand: (fd.get("brand") as string) || null,
    };

    if (editing) {
      await supabase.from("tires").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("tires").insert(payload);
    }

    setLoading(false);
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const supabase = createClient();
    await supabase.from("tires").delete().eq("id", id);
    load();
  }

  const seasonLabels: Record<string, string> = {
    winter: t("tires.winter"),
    summer: t("tires.summer"),
    all_season: t("tires.allSeason"),
  };

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
        <h1 className="text-2xl font-bold">{t("tires.title")}</h1>
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
                <Label>{t("tires.title")}</Label>
                <Select value={season} onValueChange={(v) => { if (v) setSeason(v as "winter" | "summer" | "all_season"); }}>
                  <SelectTrigger>
                    <SelectValue>
                      {seasonLabels[season]}
                    </SelectValue>
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
                  <Label>{t("tires.year")}</Label>
                  <Input name="year" type="number" min="2000" max="2099" defaultValue={editing?.year ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>{t("tires.brand")}</Label>
                  <Input name="brand" defaultValue={editing?.brand ?? ""} />
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
        onDelete={handleDelete}
        onEdit={openEdit}
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
