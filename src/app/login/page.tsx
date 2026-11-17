"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import { cn, ROLE_LABELS } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { users, loginWithCredentials } = useAppStore();

  const [email, setEmail] = useState("nour.saleh@launchpad-agency.ai");
  const [password, setPassword] = useState("Agency@2026");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials({ email, password });
      if (!res.ok) {
        setErrorMsg(res.error || "تعذر تسجيل الدخول، تحقق من البيانات.");
      } else {
        router.push("/");
      }
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بخادم المصادقة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuickAccount = (memberEmail: string) => {
    setEmail(memberEmail);
    setPassword("Agency@2026");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 max-w-5xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Right Side (RTL): Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>بوابة الدخول الآمن للفريق (Supabase Auth & RBAC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              تسجيل الدخول إلى كوبايلوت الوكالة
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              ادخل ببريدك المؤسسي وكلمة المرور لفتح مساحة العمل المخصصة لدورك الوظيفي وأدوات الـ AI Copilot المربوطة بهوية العملاء.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                البريد الإلكتروني الوظيفي (Work Email):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@launchpad-agency.ai"
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 text-sm font-en focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                كلمة المرور (Password):
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 text-sm font-en focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-ai-gradient text-white text-sm font-extrabold shadow-ai-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? "جاري التحقق من الصلاحيات..."
                  : "تسجيل الدخول وفتح مساحة العمل"}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Role Demo Accounts Selector */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700">
                حسابات الفريق الجاهزة للتجربة الفورية (اضغط لاختيار الحساب):
              </span>
              <span className="text-[10px] font-en text-slate-400">
                {isSupabaseConfigured ? "Supabase Auth Linked" : "RBAC Auth"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = email.toLowerCase() === u.email.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectQuickAccount(u.email)}
                    className={cn(
                      "p-2.5 rounded-xl border text-right transition flex items-center gap-2.5",
                      isSelected
                        ? "bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-400"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                    )}
                  >
                    <img
                      src={u.avatar_url}
                      alt={u.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {u.full_name}
                      </p>
                      <p className="text-[10px] text-indigo-700 font-semibold truncate">
                        {ROLE_LABELS[u.role_slug]?.ar}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Left Side (RTL): Agency Branding & Features */}
        <div className="lg:col-span-5 bg-[#0F172A] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-ai-gradient flex items-center justify-center shadow-ai-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-extrabold leading-snug">
              منصة إدارة عمليات وكالات التسويق والمساعد الذكي
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              نظام متكامل يربط خطط الحملات، خزنة هوية العملاء (Brand Kits)، المساعد الذكي لكل دور وظيفي، والتقييم الموضوعي للأداء في مكان واحد.
            </p>
          </div>

          <div className="space-y-3 my-8 z-10">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">صلاحيات مخصصة لكل دور (RBAC)</p>
                <p className="text-slate-400 mt-0.5">
                  واجهة وأدوات ذكاء اصطناعي تتكيف تلقائياً مع تخصص الموظف المسجل دخوله.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">تقييم أداء موضوعي تلقائي (AI KPI)</p>
                <p className="text-slate-400 mt-0.5">
                  احتساب فوري لنسبة التسليم في الموعد والقبول من أول مرة بدون تعديلات.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-en z-10">
            Powered by Google Gemini API & Supabase PostgreSQL
          </div>
        </div>
      </div>
    </div>
  );
}
