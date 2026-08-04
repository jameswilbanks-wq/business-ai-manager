import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "Business AI Manager",
    template: "%s · Business AI Manager",
  },
  description:
    "El sistema operativo de negocio impulsado por IA para empresas que operan por WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#14161d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className="h-full min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
