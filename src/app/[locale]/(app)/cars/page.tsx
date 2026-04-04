import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car } from "lucide-react";

export default async function CarsPage({
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("cars.myCars")}</h1>
        <Link href="/cars/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t("cars.addCar")}
          </Button>
        </Link>
      </div>

      {!cars || cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Car className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("common.noData")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
            <Link key={car.id} href={`/cars/${car.id}`} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{car.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {car.make && <span>{car.make}</span>}
                    {car.model && <span>{car.model}</span>}
                    {car.year && <span>{car.year}</span>}
                    {car.license_plate && <span>{car.license_plate}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
