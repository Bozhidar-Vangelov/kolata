import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Shield,
  Car,
  Wrench,
  Droplets,
  Ticket,
  CircleDot,
} from "lucide-react";
import { MAINTENANCE_ROUTES, type MaintenanceType } from "@/lib/constants";
import { addYears, format, parseISO } from "date-fns";

const maintenanceIcons: Record<MaintenanceType, React.ElementType> = {
  insurance: Shield,
  kasko: Shield,
  inspection: Wrench,
  oilChange: Droplets,
  vignette: Ticket,
  tires: CircleDot,
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: cars } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });

  if (!cars || cars.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <Car className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">{t("common.noData")}</h2>
        <Link href="/cars/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("cars.addCar")}
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch latest records for each car
  const carsWithData = await Promise.all(
    cars.map(async (car) => {
      const [insurance, kasko, inspection, vignette, oilChange, tires] =
        await Promise.all([
          supabase
            .from("insurance")
            .select("start_date, end_date")
            .eq("car_id", car.id)
            .order("end_date", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("kasko")
            .select("start_date, end_date")
            .eq("car_id", car.id)
            .order("end_date", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("technical_inspection")
            .select("start_date, end_date")
            .eq("car_id", car.id)
            .order("end_date", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("vignette")
            .select("start_date, end_date")
            .eq("car_id", car.id)
            .order("end_date", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("oil_change")
            .select("change_date")
            .eq("car_id", car.id)
            .order("change_date", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("tires")
            .select("season")
            .eq("car_id", car.id)
            .limit(1)
            .single(),
        ]);

      return {
        ...car,
        latestEndDates: {
          insurance: insurance.data?.end_date ?? null,
          kasko: kasko.data?.end_date ?? null,
          inspection: inspection.data?.end_date ?? null,
          vignette: vignette.data?.end_date ?? null,
          oilChange: oilChange.data?.change_date
            ? format(
                addYears(parseISO(oilChange.data.change_date), 1),
                "yyyy-MM-dd"
              )
            : null,
          tires: tires.data ? "set" : null,
        },
        latestStartDates: {
          insurance: insurance.data?.start_date ?? null,
          kasko: kasko.data?.start_date ?? null,
          inspection: inspection.data?.start_date ?? null,
          vignette: vignette.data?.start_date ?? null,
        },
      };
    })
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("nav.dashboard")}</h1>
        <Link href="/cars/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t("cars.addCar")}
          </Button>
        </Link>
      </div>

      {carsWithData.map((car) => (
        <Card key={car.id}>
          <CardHeader className="pb-3">
            <Link href={`/cars/${car.id}`}>
              <CardTitle className="text-lg hover:underline">
                {car.name}
              </CardTitle>
            </Link>
            {car.license_plate && (
              <p className="text-sm text-muted-foreground">
                {car.license_plate}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {(Object.keys(MAINTENANCE_ROUTES) as MaintenanceType[]).map(
                (type) => {
                  const Icon = maintenanceIcons[type];
                  const endDate = car.latestEndDates[type];
                  const startDate =
                    car.latestStartDates[
                      type as keyof typeof car.latestStartDates
                    ] ?? null;
                  return (
                    <Link
                      key={type}
                      href={`/cars/${car.id}/${MAINTENANCE_ROUTES[type]}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent px-1"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {t(`maintenance.${type}`)}
                        </span>
                      </div>
                      {type === "tires" ? (
                        endDate ? (
                          <Badge variant="success">✓</Badge>
                        ) : (
                          <Badge variant="outline">{t("status.notSet")}</Badge>
                        )
                      ) : (
                        <StatusBadge endDate={endDate} startDate={startDate} />
                      )}
                    </Link>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
