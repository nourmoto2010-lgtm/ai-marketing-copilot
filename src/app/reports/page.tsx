"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";

export default function ClientReportsPage() {
  const { clients, brandKits, campaigns, tasks, geminiApiKey } = useAppStore();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || "client-sweets"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportText, setReportText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const client =
    clients.find((c) => c.id === selectedClientId) || clients[0];
  const brandKit =
    brandKits.find((b) => b.client_id === client.id) || brandKits[0];
  const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);
  const clientTasks = tasks.filter((t) => t.client_id === client.id);
  const pkg = client.monthly_package;
  const activeCamp = clientCampaigns[0];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/client-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client,
          brandKit,
          campaigns: clientCampaigns,
          tasks: clientTasks,
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.report) {
        setReportText(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    handleGenerateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  const handleCopyReport = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>بوابة متابعة العميل والتقارير الذكية (Client Progress & Approvals)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            توليد الملخص الأسبوعي والشهري التلقائي للعملاء بالذكاء الاصطناعي
          </h1>
          <p className="text-xs text-slate-500">
            يجمع الـ AI ما تم إنجازه من الباقة الشهرية، المهام المعتمدة، ومؤشرات الحملات الإعلانية (<span className="font-en">ROAS, CTR, CPL</span>) في تقرير تنفيذي جاهز للإرسال للعميل.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.logo_url} {c.name} ({c.sector_label_ar})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isGenerating ? "جاري التوليد..." : "إعادة توليد التقرير بالـ AI"}
            </span>
          </button>
        </div>
      </div>

      {/* Client Campaign & Package Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft">
          <p className="text-xs text-slate-500 font-semibold">
            إنجاز البوستات والـ Reels
          </p>
          <p className="text-2xl font-extrabold font-en text-slate-900 mt-1">
            {pkg.posts_done + pkg.reels_done} / {pkg.posts_target + pkg.reels_target}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            ✓ التزام بالجدول الزمني 100%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft">
          <p className="text-xs text-slate-500 font-semibold">
            العائد على الصرف الإعلاني (ROAS)
          </p>
          <p className="text-2xl font-extrabold font-en text-emerald-600 mt-1">
            {activeCamp?.ad_metrics.roas || 5.2}x
          </p>
          <p className="text-[11px] text-slate-500 font-en mt-1">
            CTR: {activeCamp?.ad_metrics.ctr || 3.2}% | CPL: $
            {activeCamp?.ad_metrics.cpl_usd || 2.0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft">
          <p className="text-xs text-slate-500 font-semibold">
            الميزانية الإعلانية المستثمرة
          </p>
          <p className="text-2xl font-extrabold font-en text-blue-600 mt-1">
            ${pkg.ad_spend_usd.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-en mt-1">
            من إجمالي ${pkg.ad_budget_usd.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft">
          <p className="text-xs text-slate-500 font-semibold">
            إجمالي التحويلات / الطلبات المحققة
          </p>
          <p className="text-2xl font-extrabold font-en text-indigo-600 mt-1">
            {activeCamp?.ad_metrics.conversions.toLocaleString() || 650}
          </p>
          <p className="text-[11px] text-indigo-700 font-bold mt-1">
            عبر الحملة النشطة والـ DM Funnel
          </p>
        </div>
      </div>

      {/* Generated Executive Report View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card-soft p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{client.logo_url}</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                مسودة التقرير الجاهزة للإرسال أو العرض على {client.name}
              </h2>
              <p className="text-xs text-slate-500">
                يمكنك نسخ التقرير بصيغة WhatsApp / Email أو تصديره مباشرة للعميل.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم نسخ التقرير بالكامل!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ التقرير للإرسال للعميل</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-cairo">
          {reportText || "جاري إعداد التقرير التنفيذي بالذكاء الاصطناعي..."}
        </div>
      </div>
    </div>
  );
}
