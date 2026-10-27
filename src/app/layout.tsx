import type { Metadata } from "next";
import "./globals.css";
import { ViewModeProvider } from "@/context/ViewModeContext";
import DeviceFrame from "@/components/DeviceFrame";

export const metadata: Metadata = {
  title: "Asistente Financiero IA",
  description: "Tu asesor financiero personal impulsado por Inteligencia Artificial.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ViewModeProvider>
          <DeviceFrame>
            <main className="main-content">
              {children}
            </main>
          </DeviceFrame>
        </ViewModeProvider>
      </body>
    </html>
  );
}
