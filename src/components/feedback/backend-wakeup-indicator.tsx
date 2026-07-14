"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, Coffee, Server, Sparkles } from "lucide-react";

type RequestEvent = CustomEvent<{ id: string; path: string }>;

export function BackendWakeupIndicator() {
  const activeRequests = useRef(new Set<string>());
  const startedAt = useRef(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    function handleStart(event: Event) {
      const { id } = (event as RequestEvent).detail;
      if (activeRequests.current.size === 0) {
        startedAt.current = Date.now();
        setElapsedSeconds(0);
      }
      activeRequests.current.add(id);
      setPendingCount(activeRequests.current.size);
    }

    function handleEnd(event: Event) {
      const { id } = (event as RequestEvent).detail;
      activeRequests.current.delete(id);
      setPendingCount(activeRequests.current.size);
      if (activeRequests.current.size === 0) {
        setVisible(false);
        setElapsedSeconds(0);
      }
    }

    window.addEventListener("financa:api-request-start", handleStart);
    window.addEventListener("financa:api-request-end", handleEnd);
    return () => {
      window.removeEventListener("financa:api-request-start", handleStart);
      window.removeEventListener("financa:api-request-end", handleEnd);
    };
  }, []);

  useEffect(() => {
    if (pendingCount === 0) return;
    const showTimer = window.setTimeout(() => setVisible(true), 1_200);
    const elapsedTimer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1_000));
    }, 1_000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(elapsedTimer);
    };
  }, [pendingCount]);

  if (!visible) return null;

  const serverIsWaking = elapsedSeconds >= 6;
  const takingLonger = elapsedSeconds >= 45;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Inicializando o sistema">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-200/80 bg-background p-6 shadow-2xl shadow-emerald-950/25 dark:border-emerald-900">
        <div className="pointer-events-none absolute -right-12 -top-14 size-40 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-start gap-4">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Server className="size-6" />
              <span className="absolute -right-1 -top-1 size-3 animate-pulse rounded-full border-2 border-background bg-emerald-500" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Inicializando</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Preparando sua casa…</h2>
            </div>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
            <span className="block h-full w-1/2 animate-[loading-slide_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl bg-muted/60 p-3.5">
            {serverIsWaking ? <Coffee className="mt-0.5 size-5 shrink-0 text-amber-600" /> : <Cloud className="mt-0.5 size-5 shrink-0 text-emerald-600" />}
            <div className="text-sm leading-5">
              <p className="font-medium">{serverIsWaking ? "O servidor está despertando" : "Conectando ao servidor"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{takingLonger ? "Está levando um pouco mais que o normal, mas continuamos tentando." : serverIsWaking ? "Após um período sem uso, isso pode levar até dois minutos." : "Isso normalmente leva apenas alguns segundos."}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-emerald-500" /> Você não precisa atualizar a página</span>
            <span className="tabular-nums">{elapsedSeconds}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
