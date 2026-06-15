"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Eye, History, Settings } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-around px-2 z-50">
      <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/dashboard' || pathname === '/' ? 'text-[var(--cyan-primary)]' : 'text-[var(--text-secondary)]'}`}>
        <BarChart2 className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Dashboard</span>
      </Link>
      <Link href="/watchlist" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/watchlist' ? 'text-[var(--cyan-primary)]' : 'text-[var(--text-secondary)]'}`}>
        <Eye className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Watchlist</span>
      </Link>
      <Link href="/history" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/history' ? 'text-[var(--cyan-primary)]' : 'text-[var(--text-secondary)]'}`}>
        <History className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">History</span>
      </Link>
      <Link href="/settings" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/settings' ? 'text-[var(--cyan-primary)]' : 'text-[var(--text-secondary)]'}`}>
        <Settings className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Settings</span>
      </Link>
    </nav>
  );
}
