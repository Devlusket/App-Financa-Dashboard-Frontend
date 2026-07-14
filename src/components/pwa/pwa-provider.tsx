"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "financa:pwa-install-dismissed";

export function PwaProvider() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone || window.sessionStorage.getItem(DISMISS_KEY)) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    let iosHintTimer: number | undefined;
    if (isIos) {
      iosHintTimer = window.setTimeout(() => {
        setShowIosHint(true);
        setVisible(true);
      }, 0);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      if (iosHintTimer) window.clearTimeout(iosHintTimer);
    };
  }, []);

  function dismiss() {
    window.sessionStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallPrompt(null);
  }

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-emerald-200 bg-background/95 p-4 shadow-2xl shadow-emerald-950/15 backdrop-blur-xl dark:border-emerald-900" aria-label="Instalar aplicativo">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{showIosHint ? <Share className="size-5" /> : <Download className="size-5" />}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">Use o Finança como aplicativo</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{showIosHint ? "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início." : "Instale na tela inicial para abrir mais rápido e em tela cheia."}</p>
        {installPrompt && <Button size="sm" className="mt-3" onClick={() => void install()}><Download /> Instalar aplicativo</Button>}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Fechar aviso de instalação"><X /></Button>
    </aside>
  );
}
