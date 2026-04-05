import { DeleteCarButton } from "@/components/cars/delete-car-button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { MAINTENANCE_ROUTES, type MaintenanceType } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { addYears, format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CircleDot,
  Droplets,
  Shield,
  Ticket,
  Wrench,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const icons: Record<MaintenanceType, React.ElementType> = {
  insurance: Shield,
  kasko: Shield,
  inspection: Wrench,
  oilChange: Droplets,
  vignette: Ticket,
  tires: CircleDot,
};

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ locale: string; carId: string }>;
}) {
  const { locale, carId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", carId)
    .single();

  if (!car) notFound();

  // Fetch latest end dates for each type
  const [insurance, kasko, inspection, vignette, oilChange] = await Promise.all(
    [
      supabase
        .from("insurance")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .order("end_date", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("kasko")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .order("end_date", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("technical_inspection")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .order("end_date", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("vignette")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .order("end_date", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("oil_change")
        .select("change_date")
        .eq("car_id", carId)
        .order("change_date", { ascending: false })
        .limit(1)
        .single(),
    ]
  );

  const tiresCount = await supabase
    .from("tires")
    .select("id", { count: "exact", head: true })
    .eq("car_id", carId);

  const endDates: Record<string, string | null> = {
    insurance: insurance.data?.end_date ?? null,
    kasko: kasko.data?.end_date ?? null,
    inspection: inspection.data?.end_date ?? null,
    oilChange: oilChange.data?.change_date
      ? format(addYears(parseISO(oilChange.data.change_date), 1), "yyyy-MM-dd")
      : null,
    vignette: vignette.data?.end_date ?? null,
  };

  const startDates: Record<string, string | null> = {
    insurance: insurance.data?.start_date ?? null,
    kasko: kasko.data?.start_date ?? null,
    inspection: inspection.data?.start_date ?? null,
    vignette: vignette.data?.start_date ?? null,
  };

  const hasTires = (tiresCount.count ?? 0) > 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>
        <DeleteCarButton carId={carId} />
      </div>

      <div>
        <h1 className="text-2xl font-bold">{car.name}</h1>
        <div className="flex gap-3 text-sm text-muted-foreground mt-1">
          {car.make && <span>{car.make}</span>}
          {car.model && <span>{car.model}</span>}
          {car.year && <span>{car.year}</span>}
          {car.license_plate && <span>{car.license_plate}</span>}
        </div>
      </div>

      <div className="grid gap-3">
        {(Object.keys(MAINTENANCE_ROUTES) as MaintenanceType[]).map((type) => {
          const Icon = icons[type];
          return (
            <Link
              key={type}
              href={`/cars/${carId}/${MAINTENANCE_ROUTES[type]}`}
            >
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">
                      {t(`maintenance.${type}`)}
                    </span>
                  </div>
                  {type === "tires" ? (
                    hasTires ? (
                      <Badge variant="success">✓</Badge>
                    ) : (
                      <Badge variant="outline">{t("status.notSet")}</Badge>
                    )
                  ) : (
                    <StatusBadge
                      endDate={endDates[type]}
                      startDate={startDates[type]}
                    />
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
