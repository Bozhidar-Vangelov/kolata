"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type TableName = keyof Database["public"]["Tables"];

interface UseMaintenanceOptions<T> {
  table: TableName;
  orderBy: string & keyof T;
  onOpenAdd?: () => void;
  onOpenEdit?: (record: T) => void;
  onCloseForm?: () => void;
}

export function useMaintenance<T extends { id: string }>({
  table,
  orderBy,
  onOpenAdd,
  onOpenEdit,
  onCloseForm,
}: UseMaintenanceOptions<T>) {
  const params = useParams();
  const carId = params.carId as string;
  const [records, setRecords] = useState<T[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from(table) as any)
      .select("*")
      .eq("car_id", carId)
      .order(orderBy, { ascending: false });
    setRecords((data as T[] | null) ?? []);
  }, [carId, table, orderBy]);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setErrors({});
    onOpenAdd?.();
    setShowForm(true);
  }

  function openEdit(record: T) {
    setEditing(record);
    setErrors({});
    onOpenEdit?.(record);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setErrors({});
    onCloseForm?.();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from(table) as any).delete().eq("id", id);
    load();
  }

  async function submitRecord(payload: Record<string, unknown>): Promise<boolean> {
    setLoading(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = supabase.from(table) as any;
    const { error } = editing
      ? await query.update(payload).eq("id", editing.id)
      : await query.insert(payload);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return false;
    }

    closeForm();
    load();
    return true;
  }

  return {
    carId,
    records,
    showForm,
    editing,
    loading,
    errors,
    setErrors,
    openAdd,
    openEdit,
    closeForm,
    handleDelete,
    submitRecord,
  };
}
