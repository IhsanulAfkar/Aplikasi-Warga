import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { FloatingAIChat } from "@/components/chat";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import QueryProvider from "@/providers/QueryProvider";
import Providers from "@/providers";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Aplikasi Warga RT/RW",
  description: "Aplikasi Manajemen Warga, Iuran, Kas, dan Pengumuman Lingkungan RT/RW",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="antialiased bg-slate-100 min-h-screen flex flex-col items-center justify-start text-slate-900 selection:bg-blue-500 selection:text-white">
        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  );
}
