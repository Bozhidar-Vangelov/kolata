"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function NewCarPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("cars").insert({
      user_id: user.id,
      name: formData.get("name") as string,
      make: (formData.get("make") as string) || null,
      model: (formData.get("model") as string) || null,
      year: formData.get("year") ? Number(formData.get("year")) : null,
      license_plate: (formData.get("license_plate") as string) || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="p-4">
      <Link
        href="/cars"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t("cars.addCar")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="name">{t("cars.name")} *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">{t("cars.make")}</Label>
                <Input id="make" name="make" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">{t("cars.model")}</Label>
                <Input id="model" name="model" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">{t("cars.year")}</Label>
                <Input id="year" name="year" type="number" min="1900" max="2099" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">{t("cars.licensePlate")}</Label>
                <Input id="license_plate" name="license_plate" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? t("common.loading") : t("common.save")}
            </Button>
            <Link href="/cars">
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
