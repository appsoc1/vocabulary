import "./globals.css";
import type { Viewport } from "next";
import { ClientLayout } from "./ClientLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export const metadata = {
  title: "English SRS",
  description: "Spaced Repetition System for English Learning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col md:flex-row" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
