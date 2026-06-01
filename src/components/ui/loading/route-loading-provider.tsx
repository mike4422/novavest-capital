"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type RouteLoadingContextValue = {
  isRouteLoading: boolean;
  startRouteLoading: (label?: string) => void;
  stopRouteLoading: () => void;
};

const RouteLoadingContext = createContext<RouteLoadingContextValue | null>(null);

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function shouldShowLoaderForAnchor(anchor: HTMLAnchorElement) {
  if (!anchor.href) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const current = new URL(window.location.href);
  const next = new URL(anchor.href, window.location.href);

  if (next.origin !== current.origin) return false;
  if (next.pathname === current.pathname && next.search === current.search) return false;
  if (next.hash && next.pathname === current.pathname && next.search === current.search) return false;

  return true;
}

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [label, setLabel] = useState("Loading secure page...");

  const startRouteLoading = useCallback((nextLabel = "Loading secure page...") => {
    setLabel(nextLabel);
    setIsRouteLoading(true);
  }, []);

  const stopRouteLoading = useCallback(() => {
    setIsRouteLoading(false);
  }, []);

  useEffect(() => {
    stopRouteLoading();
  }, [pathname, stopRouteLoading]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;

      if (!anchor || !shouldShowLoaderForAnchor(anchor)) return;
      startRouteLoading("Opening secure page...");
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [startRouteLoading]);

  const value = useMemo(
    () => ({ isRouteLoading, startRouteLoading, stopRouteLoading }),
    [isRouteLoading, startRouteLoading, stopRouteLoading]
  );

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isRouteLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/70 p-6 backdrop-blur-xl"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ y: 18, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 text-center shadow-[0_0_90px_rgba(45,212,191,.18)]"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-teal-300/30 bg-teal-300/10">
                <Loader2 className="h-8 w-8 animate-spin text-teal-200" />
              </div>
              <p className="mt-5 text-lg font-black text-white">{label}</p>
              <p className="mt-2 text-sm text-slate-400">Please wait while NovaVest prepares your request.</p>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 animate-[nova-progress_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoading() {
  const context = useContext(RouteLoadingContext);
  if (!context) {
    throw new Error("useRouteLoading must be used inside RouteLoadingProvider");
  }
  return context;
}
