"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  KeyRound,
  LogIn,
  LogOut,
  RotateCcw,
  Shield,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import { ROLE_LABELS } from "@/lib/utils";

export function TopNavbar() {
  const {
    users,
    currentUser,
    currentRole,
    setCurrentUserById,
    clients,
    selectedClientFilter,
    setSelectedClientFilter,
    geminiApiKey,
    setGeminiApiKey,
    latestKpiToast,
    dismissKpiToast,
    isAuthenticated,
    logoutUser,
    resetToSeedData,
  } = useAppStore();
  const router = useRouter();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(tempKey);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setShowKeyModal(false);
    }, 900);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-card-soft">
        {/* Right side (RTL): Role-Based Access Control (RBAC) Live Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F172A] text-white text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>محاكي الأدوار والصلاحيات (RBAC):</span>
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserById(e.target.value)}
              className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} — {ROLE_LABELS[u.role_slug]?.ar} ({ROLE_LABELS[u.role_slug]?.en})
                </option>
              ))}
            </select>
          </div>

          {/* Client Global Filter */}
          <div className="hidden xl:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">تصفية حسب العميل:</span>
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">جميع العملاء (4 حسابات نشطة)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.logo_url} {c.name} ({c.sector_label_ar})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Left side (RTL): Permissions Badges & Gemini API Key Setup */}
        <div className="flex items-center gap-3">
          {/* Active Role Permissions Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            {currentRole.permissions.can_split_campaigns && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                ✓ تقسيم الحملات بالـ AI
              </span>
            )}
            {currentRole.permissions.can_approve && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                ✓ اعتماد المخرجات والتقييم
              </span>
            )}
            {!currentRole.permissions.can_approve && (
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                ✓ مساحة عمل {ROLE_LABELS[currentUser.role_slug]?.en} Copilot
              </span>
            )}
          </div>

          {/* Gemini API Key Status Button */}
          <button
            onClick={() => {
              setTempKey(geminiApiKey);
              setShowKeyModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-en">
              {geminiApiKey ? "Gemini API: Connected" : "إعداد مفتاح Gemini API"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                geminiApiKey ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetToSeedData}
            title="إعادة ضبط البيانات التجريبية الأصلية"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Login / Logout Auth Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={async () => {
                await logoutUser();
                router.push("/login");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تبديل الحساب / خروج</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-indigo-600 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </header>

      {/* Live KPI Score Recalculation Toast Banner */}
      {latestKpiToast && (
        <div className="bg-slate-900 text-white px-6 py-2.5 border-b border-indigo-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-en font-bold text-[11px]">
              AI KPI Engine Live
            </span>
            <span className="font-bold text-white">
              {latestKpiToast.summaryAr}
            </span>
            <span className="font-en font-extrabold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
              {latestKpiToast.previousScore} → {latestKpiToast.newScore} / 100 (
              {latestKpiToast.delta >= 0
                ? `+${latestKpiToast.delta}`
                : latestKpiToast.delta}
              )
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

      {/* Modal for Gemini API Key Configuration */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ai-gradient flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    إعداد محرك الذكاء الاصطناعي (Google Gemini API)
                  </h3>
                  <p className="text-xs text-slate-500 font-en">
                    @google/generative-ai Integration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                يعمل النظام فوراً بمحرك برومبتات هجين: يمكنك إدخال مفتاح{" "}
                <code className="font-en font-bold text-indigo-600">
                  GEMINI_API_KEY
                </code>{" "}
                هنا أو في ملف <code className="font-en">.env.local</code> للاتصال المباشر بنموذج{" "}
                <code className="font-en">gemini-2.0-flash</code>، أو تركه فارغاً لتجربة المحرك الذكي المدمج المبني على خزنة هوية العملاء.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-en">
                  Google Gemini API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-en focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-ai-gradient shadow-ai-glow flex items-center gap-1.5"
                >
                  {savedNotice ? (
                    <>
                      <Check className="w-4 h-4" />
                      تم الحفظ بنجاح!
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      حفظ وتفعيل المفتاح
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
