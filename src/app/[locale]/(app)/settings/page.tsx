"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useParams } from "next/navigation";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Check existing push subscription on mount
  useEffect(() => {
    async function checkSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission !== "granted") return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setPushEnabled(true);
        }
      } catch {
        // Ignore - push not available
      }
    }
    checkSubscription();
  }, []);

  function handleLocaleChange(locale: string | null) {
    if (!locale) return;
    router.replace(pathname, { locale });
  }

  async function handlePushToggle(enabled: boolean) {
    if (!enabled) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      } catch {
        // Ignore unsubscribe errors
      }
      setPushEnabled(false);
      return;
    }

    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setPushEnabled(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("notifications.pushError")
      );
    }
    setPushLoading(false);
  }

  async function handleTestPush() {
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Test push failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test push failed");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t("nav.settings")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("nav.language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currentLocale} onValueChange={handleLocaleChange}>
            <SelectTrigger>
              <SelectValue>
                {currentLocale === "bg" ? "Български" : "English"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bg">Български</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("notifications.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>{t("notifications.enablePush")}</Label>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={pushLoading}
            />
          </div>
          {pushEnabled && process.env.NODE_ENV !== "production" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={handleTestPush}
            >
              {t("notifications.testPush")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            {t("nav.signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
