import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROTOCOLE A.K2708",
  description: "Une expérience narrative interactive consacrée à Artyom Kovaks, Traqueur de l'Ordre.",
  metadataBase: new URL("https://artyom-ak2708.tdesnoyers6655640.chatgpt.site"),
  openGraph: {
    title: "PROTOCOLE A.K2708",
    description: "L'Ordre vous demande d'évaluer son Traqueur. Artyom, lui, vous observe déjà.",
    type: "website",
    images: [{ url: "https://artyom-ak2708.tdesnoyers6655640.chatgpt.site/og.png", width: 1568, height: 1003, alt: "PROTOCOLE A.K2708 — L'Ordre vous évalue" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PROTOCOLE A.K2708",
    description: "L'Ordre vous demande d'évaluer son Traqueur. Artyom, lui, vous observe déjà.",
    images: ["https://artyom-ak2708.tdesnoyers6655640.chatgpt.site/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
