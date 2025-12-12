import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import { AuthProvider } from "@/src/components/AuthProvider";
import { ServiceWorkerRegistration } from "@/src/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Hanzi Ledger - Chinese Vocabulary Learning",
  description: "Learn Chinese vocabulary with flashcards and spaced repetition. Paper & ink themed, calm and focused study.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hanzi Ledger",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Hanzi Ledger",
    title: "Hanzi Ledger - Chinese Vocabulary Learning",
    description: "Learn Chinese vocabulary with flashcards and spaced repetition.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F3EF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background font-latin antialiased">
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <ServiceWorkerRegistration />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
