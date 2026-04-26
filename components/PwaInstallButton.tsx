"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  // iOS Safari
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window.navigator as any).standalone) return true;
  return window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
}

export default function PwaInstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canPrompt = !!deferred;
  const shouldShow = !installed;
  const helpText = useMemo(() => {
    if (installed) return "";
    if (isIos()) {
      return 'Di iPhone/iPad: buka menu "Share" lalu pilih "Add to Home Screen".';
    }
    return 'Jika tombol install tidak muncul, buka menu browser lalu pilih "Install app".';
  }, [installed]);

  if (!shouldShow) return null;

  const onInstallClick = async () => {
    if (!deferred) {
      setShowHelp(true);
      return;
    }

    await deferred.prompt();
    await deferred.userChoice;
    // If accepted, appinstalled will fire. If dismissed, keep button visible.
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant={canPrompt ? "default" : "outline"}
        size="sm"
        onClick={onInstallClick}
        className="shadow-md bg-white"
      >
        Install app
      </Button>
      {showHelp && (
        <div className="max-w-[240px] rounded-xl bg-white/90 px-3 py-2 text-xs text-[#475569] shadow-sm border border-[#E2E8F0]">
          {helpText}
        </div>
      )}
    </div>
  );
}

