"use client";

import React from "react";
import { useViewMode } from "@/context/ViewModeContext";
import styles from "./ViewModeSwitch.module.css";

export default function ViewModeSwitch() {
  const { viewMode, toggleViewMode } = useViewMode();
  const isMobile = viewMode === "mobile";

  return (
    <div className={styles.switchBar} title="Alternar barra de dispositivos (Ctrl+Shift+M)">
      <button
        type="button"
        className={`${styles.devToolsButton} ${isMobile ? styles.activeDevTools : ""}`}
        onClick={toggleViewMode}
        aria-label="Alternar vista de dispositivo"
      >
        {/* Ícono de Chrome DevTools Toggle Device Toolbar */}
        <span className={styles.deviceIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Monitor / Laptop de fondo */}
            <rect x="2" y="3" width="13" height="11" rx="1.5" />
            <path d="M5 18h7" />
            <path d="M8.5 14v4" />
            {/* Celular al frente */}
            <rect x="13" y="7" width="9" height="14" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
            <line x1="16" x2="19" y1="9" y2="9" strokeWidth="1.5" />
            <circle cx="17.5" cy="18" r="0.8" fill="currentColor" />
          </svg>
        </span>

        <span className={styles.deviceLabel}>
          {isMobile ? "Vista Celular" : "Vista Monitor"}
        </span>

        <span className={`${styles.badge} ${isMobile ? styles.badgeActive : ""}`}>
          {isMobile ? "393 × 852" : "100%"}
        </span>
      </button>
    </div>
  );
}
