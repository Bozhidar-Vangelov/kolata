"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YearPicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  validateRequired,
  validateYear,
  validateMaxLength,
  hasErrors,
} from "@/lib/validation";

const CAR_MAX_LENGTH = 30;
const MAKE_MAX_LENGTH = 30;
const MODEL_MAX_LENGTH = 30;
const LICENSE_PLATE_MAX_LENGTH = 15;

export default function NewCarPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    const name = (fd.get("name") as string).trim();
    const make = (fd.get("make") as string).trim();
    const model = (fd.get("model") as string).trim();
    const licensePlate = (fd.get("license_plate") as string).trim();

    validateRequired(name, "name", errs, t);
    validateMaxLength(name, "name", CAR_MAX_LENGTH, errs, t);
    validateRequired(make, "make", errs, t);
    validateMaxLength(make, "make", MAKE_MAX_LENGTH, errs, t);
    validateRequired(model, "model", errs, t);
    validateMaxLength(model, "model", MODEL_MAX_LENGTH, errs, t);
    validateRequired(licensePlate, "license_plate", errs, t);
    validateMaxLength(
      licensePlate,
      "license_plate",
      LICENSE_PLATE_MAX_LENGTH,
      errs,
      t
    );
    const year = validateYear(fd.get("year") as string, errs, t, { required: true });

    if (hasErrors(errs)) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("cars").insert({
      user_id: user.id,
      name,
      make,
      model,
      year,
      license_plate: licensePlate,
    });

    if (error) {
      toast.error(error.message);
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
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("cars.name")} *</Label>
              <Input id="name" name="name" maxLength={CAR_MAX_LENGTH} />
              <FieldError error={errors.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">{t("cars.make")} *</Label>
                <Input id="make" name="make" maxLength={MAKE_MAX_LENGTH} />
                <FieldError error={errors.make} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">{t("cars.model")} *</Label>
                <Input id="model" name="model" maxLength={MODEL_MAX_LENGTH} />
                <FieldError error={errors.model} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">{t("cars.year")} *</Label>
                <YearPicker name="year" min={1900} />
                <FieldError error={errors.year} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">{t("cars.licensePlate")} *</Label>
                <Input
                  id="license_plate"
                  name="license_plate"
                  maxLength={LICENSE_PLATE_MAX_LENGTH}
                />
                <FieldError error={errors.license_plate} />
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
