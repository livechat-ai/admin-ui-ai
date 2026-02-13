import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KLive-AI Admin",
  description: "Knowledge Base & AI Management for KLive Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-muted/40">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-6">
                <h1 className="text-lg font-semibold">KLive-AI Admin</h1>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/knowledge"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
                >
                  📚 Knowledge Base
                </Link>
                <Link
                  href="/playground"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
                >
                  💬 Playground
                </Link>
              </nav>
              <div className="border-t p-4">
                <p className="text-xs text-muted-foreground">
                  KLive-AI v1.0.0
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
