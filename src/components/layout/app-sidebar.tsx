"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  FileSpreadsheet,
  Kanban,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, currentRole, tasks, clients } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const myTasksCount = tasks.filter(
    (t) =>
      t.assigned_to === currentUser.id &&
      !["approved", "published"].includes(t.status)
  ).length;

  const pendingReviewsCount = tasks.filter(
    (t) => t.status === "in_review"
  ).length;

  const navItems = [
    {
      href: "/",
      label_ar: "مركز القيادة والتقييم",
      label_en: "Director & KPI Scorecard",
      icon: BarChart3,
      badge: currentRole.permissions.can_view_all_scores ? "AI KPI" : "بطاقتي",
    },
    {
      href: "/workspace",
      label_ar: "مساحة العمل والمهام الذكية",
      label_en: "Smart Kanban & Copilot",
      icon: Kanban,
      badge:
        currentRole.permissions.can_approve && pendingReviewsCount > 0
          ? `${pendingReviewsCount} للمراجعة`
          : `${myTasksCount} مهام`,
    },
    {
      href: "/clients",
      label_ar: "العملاء وخزنة الهوية",
      label_en: "Clients & Brand Vault",
      icon: Briefcase,
      badge: `${clients.length} عملاء`,
    },
    {
      href: "/reports",
      label_ar: "بوابة التقارير والاعتمادات",
      label_en: "Client Progress & Reports",
      icon: FileSpreadsheet,
      badge: "PDF",
    },
    ...(currentUser.role_slug === "ceo"
      ? [
          {
            href: "/settings",
            label_ar: "الإعدادات الإدارية للنظام",
            label_en: "CEO Admin & System Config",
            icon: Settings,
            badge: "Admin",
          },
        ]
      : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Top Brand Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ai-gradient flex items-center justify-center shadow-ai-glow shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">
                  كوبايلوت الوكالة
                </h1>
                <span className="text-[10px] font-en font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-en">
                AI Marketing Copilot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active User Identity Card */}
        <div className="mx-4 mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">الحساب المسجل حالياً:</p>
              <p className="text-sm font-bold text-white truncate">
                {currentUser.full_name}
              </p>
              <p className="text-[11px] text-indigo-300 truncate">
                {currentUser.job_title_ar}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 mt-5 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            الوحدات الأساسية
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all group",
                  isActive
                    ? "bg-ai-gradient text-white font-bold shadow-ai-glow"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-indigo-400"
                    )}
                  />
                  <div className="truncate">
                    <div>{item.label_ar}</div>
                    <div
                      className={cn(
                        "text-[10px] font-en",
                        isActive ? "text-indigo-100" : "text-slate-400"
                      )}
                    >
                      {item.label_en}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Client Filter / Brand Vault Links */}
        <div className="px-4 mt-6">
          <p className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            خزنة هوية العملاء (Brand Kits)
          </p>
          <div className="space-y-1">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">{client.logo_url}</span>
                  <span className="truncate">{client.name}</span>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: client.cover_color }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Agency Operational Pulse */}
      <div className="p-4 m-4 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            القبول من أول مرة
          </span>
          <span className="font-en font-bold text-emerald-400">93%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-[93%]" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 px-4 py-3 rounded-2xl bg-[#0F172A] text-white shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-extrabold"
      >
        <Menu className="w-4 h-4 text-indigo-400" />
        <span>القائمة</span>
      </button>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex">
          <aside className="w-72 max-w-[85vw] bg-[#0F172A] text-white h-full overflow-y-auto border-l border-slate-800">
            {sidebarContent}
          </aside>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-[#0F172A] text-white flex-col justify-between border-l border-slate-800 min-h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
