import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { SidebarProvider } from "@/components/layout/SidebarProvider";

export const metadata: Metadata = {
  title: "Agentic AI Trading Research Desk",
  description: "AI yang berpikir, Manusia yang memutuskan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden pt-14 pb-16 md:pb-0">
        <SidebarProvider>
          <Header />
          <div className="flex flex-1 h-[calc(100vh-56px)] md:h-[calc(100vh-56px)] overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
              {children}
            </main>
          </div>
          <BottomNav />
        </SidebarProvider>
      </body>
    </html>
  );
}
