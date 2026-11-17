"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials({ email, password });
      if (!res.ok) {
        setErrorMsg(res.error || "بيانات الدخول غير صحيحة.");
      } else {
        router.push("/");
      }
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بخادم المصادقة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F172A]">
      <div className="grid grid-cols-1 lg:grid-cols-12 max-w-4xl w-full bg-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Right Side (RTL): Clean Private Login Form (No exposed accounts) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>بوابة الدخول الخاصة بالفريق والإدارة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              تسجيل الدخول إلى المنصة
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              يرجى إدخال بريدك الإلكتروني الوظيفي وكلمة المرور الخاصة بك للوصول إلى مهامك ومساحة العمل.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                البريد الإلكتروني (Work Email):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="email"
                  required
                  dir="ltr"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@launchpad-agency.ai"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-300 text-sm font-en focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-300 text-sm font-en focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full py-3.5 rounded-xl bg-ai-gradient text-white text-sm font-extrabold shadow-ai-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {isSubmitting ? "جاري التحقق..." : "تسجيل الدخول"}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Left Side (RTL): Agency Branding */}
        <div className="lg:col-span-5 bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-ai-gradient flex items-center justify-center shadow-ai-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-extrabold leading-snug">
              كوبايلوت الوكالة وإدارة فريق التسويق
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              منصة خاصة بأعضاء الفريق المعتمدين لإدارة الحملات، خزنة هوية العملاء، والمساعد الذكي.
            </p>
          </div>

          <div className="space-y-3 my-6">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">حماية وصلاحيات مستقلة</p>
                <p className="text-slate-400 mt-0.5">
                  يدخل كل عضو ببريده وكلمة مروره الخاصة فقط دون كشف حسابات باقي الفريق.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-en">
            Protected Agency Workspace • v2.5
          </div>
        </div>
      </div>
    </div>
  );
}
