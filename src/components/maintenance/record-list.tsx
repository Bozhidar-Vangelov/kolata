"use client";

import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

interface BaseRecord {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

export function RecordList<T extends BaseRecord>({
  records,
  renderDetails,
  endDateKey,
  onDelete,
  onEdit,
}: {
  records: T[];
  renderDetails: (record: T) => React.ReactNode;
  endDateKey?: keyof T;
  onDelete: (id: string) => void;
  onEdit: (record: T) => void;
}) {
  const t = useTranslations("common");

  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {t("noData")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                {endDateKey && (
                  <StatusBadge endDate={record[endDateKey] as string} />
                )}
                {renderDetails(record)}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(record)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(record.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function formatDate(date: string) {
  return format(parseISO(date), "dd.MM.yyyy");
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
