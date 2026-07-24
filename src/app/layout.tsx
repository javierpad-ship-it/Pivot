import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fuente de marca Lukers — MD Nichrome (display). Se expone como variable CSS
// y se usa vía la utilidad `font-brand` de Tailwind, principalmente en títulos
// y superficies de cara al cliente.
const nichrome = localFont({
  src: [
    { path: "./fonts/MDNichrome-Thin.woff2", weight: "200", style: "normal" },
    { path: "./fonts/MDNichrome-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/MDNichrome-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/MDNichrome-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-nichrome",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pivot Store",
  description: "Sistema de conteo cíclico de inventario para tiendas Lukers",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={nichrome.variable}>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
