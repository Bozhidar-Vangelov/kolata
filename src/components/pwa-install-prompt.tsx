"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Share, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
  const dismissedAt = Number(dismissed);
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
  );
}

function isIOSChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  return isIOS() && /CriOS/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as unknown as { standalone: boolean }).standalone)
  );
}

export function PWAInstallPrompt() {
  const t = useTranslations("pwa");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [iosChrome, setIOSChrome] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    if (isIOS()) {
      setShowIOSPrompt(true);
      setIOSChrome(isIOSChrome());
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setDeferredPrompt(null);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 p-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="mx-auto max-w-md rounded-xl border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Image
            src="/icons/icon-192.png"
            alt="Kolata"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{t("installTitle")}</p>
            {showIOSPrompt ? (
              <p className="text-sm text-muted-foreground">
                {iosChrome
                  ? t.rich("iosChromeInstructions", {
                      menuIcon: () => (
                        <EllipsisVertical className="inline size-4 align-text-bottom" />
                      ),
                    })
                  : t.rich("iosInstructions", {
                      shareIcon: () => (
                        <Share className="inline size-4 align-text-bottom" />
                      ),
                    })}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("installDescription")}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleDismiss}
          >
            <X className="size-4" />
          </Button>
        </div>
        {!showIOSPrompt && (
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              {t("dismissButton")}
            </Button>
            <Button size="sm" onClick={handleInstall}>
              {t("installButton")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
