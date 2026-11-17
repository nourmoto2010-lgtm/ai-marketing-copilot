"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Printer,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import { TASK_STATUS_META } from "@/lib/utils";

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

  /**
   * تصدير التقرير التنفيذي للعميل بصيغة PDF احترافية جاهزة للطباعة أو الحفظ المباشر
   */
  const handleExportPdf = () => {
    const printWindow = window.open("", "_blank", "width=960,height=800");
    if (!printWindow) {
      window.print();
      return;
    }

    const postsPct = Math.round((pkg.posts_done / pkg.posts_target) * 100);
    const reelsPct = Math.round((pkg.reels_done / pkg.reels_target) * 100);
    const designsPct = Math.round(
      (pkg.designs_done / pkg.designs_target) * 100
    );

    const tasksRowsHtml = clientTasks
      .map(
        (t) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #E2E8F0;font-weight:700;">${t.title}</td>
          <td style="padding:10px;border-bottom:1px solid #E2E8F0;">${t.platform}</td>
          <td style="padding:10px;border-bottom:1px solid #E2E8F0;">${
            TASK_STATUS_META[t.status]?.label_ar || t.status
          }</td>
          <td style="padding:10px;border-bottom:1px solid #E2E8F0;font-family:Inter,sans-serif;">${
            t.scheduled_publish_date || "-"
          }</td>
        </tr>`
      )
      .join("");

    const colorsSwatchesHtml = brandKit.colors
      .map(
        (c) => `
        <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:8px;border:1px solid #E2E8F0;font-size:12px;margin-left:8px;">
          <span style="width:12px;height:12px;border-radius:50%;background:${c.hex};display:inline-block;"></span>
          <strong>${c.name}</strong> (${c.hex})
        </span>`
      )
      .join("");

    const htmlDocument = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>تقرير الأداء الشهري - ${client.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            color: #0F172A;
            background: #FFFFFF;
            margin: 0;
            padding: 32px;
          }
          .header-banner {
            background: #0F172A;
            color: #FFFFFF;
            padding: 28px;
            border-radius: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 5px solid ${client.cover_color};
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-top: 24px;
          }
          .kpi-box {
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 16px;
            background: #F8FAFC;
          }
          .section-card {
            margin-top: 24px;
            border: 1px solid #E2E8F0;
            border-radius: 16px;
            padding: 22px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 12px;
          }
          th {
            background: #F1F5F9;
            padding: 10px;
            text-align: right;
            font-weight: 800;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;background:#EEF2FF;padding:12px 20px;border-radius:12px;border:1px solid #C7D2FE;">
          <span style="font-size:13px;font-weight:700;color:#312E81;">📄 معاينة التقرير الرسمي الجاهز للتصدير بصيغة PDF</span>
          <button onclick="window.print()" style="background:#4F46E5;color:#FFF;border:none;padding:8px 18px;border-radius:10px;font-family:'Cairo',sans-serif;font-weight:700;cursor:pointer;">حفظ كملف PDF / طباعة الآن</button>
        </div>

        <div class="header-banner">
          <div>
            <div style="font-size:12px;color:#94A3B8;font-weight:700;">AI MARKETING TEAM COPILOT & CLIENT HUB — EXECUTIVE REPORT</div>
            <h1 style="margin:6px 0 4px;font-size:24px;">${client.logo_url} التقرير التنفيذي والشهري: ${client.name}</h1>
            <div style="font-size:13px;color:#CBD5E1;">${client.sector_label_ar} • الباقة النشطة: ${pkg.package_name}</div>
          </div>
          <div style="text-align:left;font-family:'Inter',sans-serif;">
            <div style="font-size:12px;color:#94A3B8;">Date Issued</div>
            <div style="font-size:15px;font-weight:700;">${new Date().toISOString().slice(0, 10)}</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <div style="font-size:12px;color:#64748B;font-weight:700;">إنجاز البوستات (Posts)</div>
            <div style="font-size:22px;font-weight:800;font-family:'Inter',sans-serif;margin-top:4px;">${pkg.posts_done}/${pkg.posts_target} (${postsPct}%)</div>
          </div>
          <div class="kpi-box">
            <div style="font-size:12px;color:#64748B;font-weight:700;">إنجاز الريلز (Reels)</div>
            <div style="font-size:22px;font-weight:800;font-family:'Inter',sans-serif;margin-top:4px;color:#4F46E5;">${pkg.reels_done}/${pkg.reels_target} (${reelsPct}%)</div>
          </div>
          <div class="kpi-box">
            <div style="font-size:12px;color:#64748B;font-weight:700;">العائد الإعلاني (ROAS)</div>
            <div style="font-size:22px;font-weight:800;font-family:'Inter',sans-serif;margin-top:4px;color:#10B981;">${activeCamp?.ad_metrics.roas || 5.2}x</div>
          </div>
          <div class="kpi-box">
            <div style="font-size:12px;color:#64748B;font-weight:700;">إجمالي التحويلات / الطلبات</div>
            <div style="font-size:22px;font-weight:800;font-family:'Inter',sans-serif;margin-top:4px;">${activeCamp?.ad_metrics.conversions || 650}</div>
          </div>
        </div>

        <div class="section-card">
          <h3 style="margin-top:0;font-size:16px;">🎨 مطابقة الهوية البصرية (Brand Kit Compliance)</h3>
          <div style="margin-bottom:10px;">${colorsSwatchesHtml}</div>
          <div style="font-size:13px;color:#334155;line-height:1.7;"><strong>نبرة الصوت المعتمدة:</strong> ${brandKit.tone_of_voice}</div>
        </div>

        <div class="section-card">
          <h3 style="margin-top:0;font-size:16px;">✨ الملخص التنفيذي والتحليل بالذكاء الاصطناعي</h3>
          <div style="white-space:pre-wrap;font-size:13.5px;line-height:1.85;color:#1E293B;">${reportText}</div>
        </div>

        <div class="section-card">
          <h3 style="margin-top:0;font-size:16px;">📋 سجل المخرجات وجدول المحتوى (${clientTasks.length} مهام)</h3>
          <table>
            <thead>
              <tr>
                <th>عنوان المهمة / المحتوى</th>
                <th>المنصة</th>
                <th>الحالة</th>
                <th>تاريخ النشر</th>
              </tr>
            </thead>
            <tbody>
              ${tasksRowsHtml}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlDocument);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>بوابة متابعة العميل والتقارير الذكية (Client Progress & PDF Export)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            توليد وتصدير الملخص الأسبوعي والشهري للعملاء بصيغة PDF
          </h1>
          <p className="text-xs text-slate-500">
            يجمع الـ AI ما تم إنجازه من الباقة الشهرية، المهام المعتمدة، ومؤشرات الحملات الإعلانية (<span className="font-en">ROAS, CTR, CPL</span>) مع إمكانية تصديره كملف PDF رسمي بضغطة زر.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            className="px-4 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isGenerating ? "جاري التوليد..." : "توليد التقرير بالـ AI"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>تصدير التقرير PDF للعميل</span>
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
                مسودة التقرير الجاهزة للإرسال أو التصدير لـ {client.name}
              </h2>
              <p className="text-xs text-slate-500">
                يمكنك نسخ النص لإرساله عبر WhatsApp / Email أو الضغط على &quot;تصدير التقرير PDF&quot; لطباعته بهوية العميل.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>معاينة وطباعة PDF</span>
            </button>

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
                  <span>نسخ النص للإرسال</span>
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
