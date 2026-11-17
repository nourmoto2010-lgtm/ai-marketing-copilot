"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield, Sparkles, UserCheck, X } from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";

export function TopNavbar() {
  const {
    users,
    currentUser,
    setCurrentUserById,
    clients,
    selectedClientFilter,
    setSelectedClientFilter,
    latestKpiToast,
    dismissKpiToast,
    logoutUser,
  } = useAppStore();

  const router = useRouter();
  const isDirector = currentUser.role_slug === "ceo";

  return (
    <>
      <header className="min-h-16 py-2.5 bg-white border-b border-slate-200 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-30 shadow-card-soft">
        {/* Right side (RTL): Current User Badge (or Director Role Simulator if logged in as Nour Saleh) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isDirector ? (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>معاينة بصلاحية:</span>
              </div>
              <select
                value={currentUser.id}
                onChange={(e) => setCurrentUserById(e.target.value)}
                className="bg-white text-slate-900 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer max-w-[190px] sm:max-w-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} — {u.job_title_ar}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-extrabold text-slate-900">
                {currentUser.full_name}
              </span>
              <span className="text-[11px] text-indigo-700 font-semibold hidden sm:inline">
                ({currentUser.job_title_ar})
              </span>
            </div>
          )}

          {/* Client Global Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer max-w-[160px] sm:max-w-none"
            >
              <option value="all">كل العملاء ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.logo_url} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Left side (RTL): Status & Logout */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>AI Copilot متصل</span>
          </span>

          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 bg-red-50/70 hover:bg-red-600 hover:text-white text-red-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </header>

      {/* Live KPI Score Recalculation Toast Banner */}
      {latestKpiToast && (
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 border-b border-indigo-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-en font-bold text-[10px]">
              AI KPI Live
            </span>
            <span className="font-bold text-white">
              {latestKpiToast.summaryAr}
            </span>
            <span className="font-en font-extrabold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
              {latestKpiToast.previousScore} → {latestKpiToast.newScore} / 100
            </span>
          </div>
          <button
            type="button"
            onClick={dismissKpiToast}
            className="text-slate-400 hover:text-white text-[11px] font-bold flex items-center gap-1"
          >
            <span>إخفاء</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
