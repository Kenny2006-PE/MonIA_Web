"use client";

import React, { useState, useEffect } from "react";
import { useViewMode } from "@/context/ViewModeContext";
import styles from "./DeviceFrame.module.css";
import ViewModeSwitch from "./ViewModeSwitch";
import BottomNav from "./BottomNav";

export default function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { viewMode } = useViewMode();
  const isMobile = viewMode === "mobile";
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ViewModeSwitch />

      {isMobile ? (
        <div className={styles.canvas} data-view-mode="mobile">
          {/* Chasis exterior del smartphone con botones físicos */}
          <div className={styles.phoneChassis}>
            <div className={styles.btnAction} title="Action Button" />
            <div className={styles.btnVolUp} title="Volume Up" />
            <div className={styles.btnVolDown} title="Volume Down" />
            <div className={styles.btnPower} title="Power / Lock" />

            {/* Pantalla del teléfono */}
            <div className={styles.phoneScreen}>
              {/* Barra de estado con reloj, Dynamic Island y conectividad */}
              <div className={styles.statusBar}>
                <span className={styles.statusTime}>{time}</span>

                <div className={styles.dynamicIsland}>
                  <div className={styles.cameraLens} />
                  <div className={styles.sensorDot} />
                </div>

                <div className={styles.statusIcons}>
                  {/* Cobertura móvil */}
                  <svg width="15" height="11" viewBox="0 0 17 12" fill="currentColor">
                    <rect x="0" y="9" width="2.5" height="3" rx="0.8" />
                    <rect x="4" y="6" width="2.5" height="6" rx="0.8" />
                    <rect x="8" y="3" width="2.5" height="9" rx="0.8" />
                    <rect x="12" y="0" width="2.5" height="12" rx="0.8" />
                  </svg>
                  {/* Wi-Fi */}
                  <svg width="15" height="11" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1.5 3.5C5.5 0 10.5 0 14.5 3.5" />
                    <path d="M4 6.5C6.5 4.5 9.5 4.5 12 6.5" />
                    <circle cx="8" cy="10" r="1" fill="currentColor" />
                  </svg>
                  {/* Batería */}
                  <svg width="22" height="11" viewBox="0 0 25 12" fill="none">
                    <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="2" y="2" width="17" height="8" rx="1.5" fill="#10B981" />
                    <path d="M22 4.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Área de scroll de la aplicación */}
              <div className={styles.screenScrollArea}>
                {children}
              </div>

              {/* Navbar fijada dentro de la pantalla del celular */}
              <div className={styles.phoneNavWrapper}>
                <BottomNav isInsidePhone={true} />
              </div>

              {/* Barra indicadora inferior de inicio (Home Bar) */}
              <div className={styles.homeIndicatorBar}>
                <div className={styles.homeIndicator} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Modo Monitor / Pantalla Completa */
        <div className={styles.desktopCanvas} data-view-mode="desktop">
          <div className={styles.desktopViewport}>
            {children}
          </div>
          <BottomNav isInsidePhone={false} />
        </div>
      )}
    </>
  );
}
