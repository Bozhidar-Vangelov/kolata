"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO } from "date-fns";

type Status = "upcoming" | "valid" | "expiringSoon" | "expired" | "notSet";

function getStatus(
  endDate: string | null | undefined,
  startDate: string | null | undefined
): Status {
  if (!endDate) return "notSet";
  const now = new Date();
  if (startDate && differenceInDays(parseISO(startDate), now) > 0)
    return "upcoming";
  const days = differenceInDays(parseISO(endDate), now);
  if (days < 0) return "expired";
  if (days <= 30) return "expiringSoon";
  return "valid";
}

const statusVariants: Record<
  Status,
  "success" | "warning" | "destructive" | "outline" | "secondary"
> = {
  upcoming: "secondary",
  valid: "success",
  expiringSoon: "warning",
  expired: "destructive",
  notSet: "outline",
};

export function StatusBadge({
  endDate,
  startDate,
}: {
  endDate?: string | null;
  startDate?: string | null;
}) {
  const t = useTranslations("status");
  const status = getStatus(endDate, startDate);

  return <Badge variant={statusVariants[status]}>{t(status)}</Badge>;
}
