"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Bell, Settings, Menu } from "lucide-react";
import { useSidebar } from "./SidebarProvider";

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Watchlist", href: "/watchlist" },
    { name: "History", href: "/history" },
    { name: "Performance", href: "/performance" },
  ];

  return (
    <header className="h-14 fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center space-x-6">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors hidden md:block">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center space-x-2 text-[var(--cyan-primary)]">
          <Brain className="w-6 h-6" />
          <span className="font-display font-bold text-lg tracking-tight">Agentic Desk</span>
        </Link>
        <nav className="hidden md:flex space-x-1 h-14">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === "/" && link.name === "Dashboard");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`h-full flex items-center px-4 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-[var(--cyan-primary)] text-[var(--cyan-primary)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-[var(--bg-primary)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)]">
          <div className="w-2 h-2 rounded-full bg-[var(--cyan-primary)] animate-pulse" />
          <span className="text-xs text-[var(--text-secondary)] font-mono">API Connected</span>
        </div>
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--red-danger)] rounded-full border-2 border-[var(--bg-surface)]" />
        </button>
        <Link href="/settings" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
