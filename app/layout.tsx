import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mos.bi — AI-native студия дашбордов",
  description: "Figma-like AI dashboard editor with a Tremor widget library",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
