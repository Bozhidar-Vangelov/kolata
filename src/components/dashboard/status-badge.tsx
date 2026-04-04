"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO } from "date-fns";

type Status = "valid" | "expiringSoon" | "expired" | "notSet";

function getStatus(endDate: string | null | undefined): Status {
  if (!endDate) return "notSet";
  const days = differenceInDays(parseISO(endDate), new Date());
  if (days < 0) return "expired";
  if (days <= 30) return "expiringSoon";
  return "valid";
}

const statusVariants: Record<
  Status,
  "success" | "warning" | "destructive" | "outline"
> = {
  valid: "success",
  expiringSoon: "warning",
  expired: "destructive",
  notSet: "outline",
};

export function StatusBadge({ endDate }: { endDate?: string | null }) {
  const t = useTranslations("status");
  const status = getStatus(endDate);

  return <Badge variant={statusVariants[status]}>{t(status)}</Badge>;
}
