"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationDefaults {
  notify_10_days?: boolean;
  notify_5_days?: boolean;
  notify_1_day?: boolean;
}

export function NotificationToggles({
  defaults,
}: {
  defaults?: NotificationDefaults | null;
}) {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Switch
          name="notify_10_days"
          defaultChecked={defaults?.notify_10_days ?? true}
        />
        <Label>{t("notifications.notify10Days")}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          name="notify_5_days"
          defaultChecked={defaults?.notify_5_days ?? true}
        />
        <Label>{t("notifications.notify5Days")}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          name="notify_1_day"
          defaultChecked={defaults?.notify_1_day ?? true}
        />
        <Label>{t("notifications.notify1Day")}</Label>
      </div>
    </div>
  );
}
