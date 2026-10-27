"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type ViewMode = "mobile" | "desktop";

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("viewmodechange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("viewmodechange", callback);
  };
}

function getSnapshot(): ViewMode {
  if (typeof window === "undefined") return "mobile";
  const saved = localStorage.getItem("app_view_mode") as ViewMode | null;
  return saved === "desktop" || saved === "mobile" ? saved : "mobile";
}

function getServerSnapshot(): ViewMode {
  return "mobile";
}

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const viewMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.setAttribute("data-view-mode", viewMode);
  }, [viewMode]);

  const setViewMode = (mode: ViewMode) => {
    localStorage.setItem("app_view_mode", mode);
    window.dispatchEvent(new Event("viewmodechange"));
  };

  const toggleViewMode = () => {
    const next = viewMode === "mobile" ? "desktop" : "mobile";
    setViewMode(next);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
