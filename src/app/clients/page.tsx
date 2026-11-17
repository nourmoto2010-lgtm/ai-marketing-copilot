"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Palette,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";

export default function ClientsHubPage() {
  const { clients, brandKits, campaigns, tasks } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>بوابة العملاء وخزنة الهوية (Clients & Brand Vault)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة حسابات العملاء، الباقات الشهرية، والهويات البصرية
          </h1>
          <p className="text-xs text-slate-500">
            يحتفظ كل عميل بخزنة هوية ذكية (<span className="font-en font-semibold">Brand Kit & AI Memory</span>) يستدعيها الـ AI Copilot تلقائياً عند كتابة المحتوى أو توليد برومبتات التصميم.
          </p>
        </div>
      </div>

      {/* 4 Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => {
          const brandKit = brandKits.find((b) => b.client_id === client.id);
          const clientCampaigns = campaigns.filter(
            (c) => c.client_id === client.id
          );
          const clientTasks = tasks.filter((t) => t.client_id === client.id);
          const pkg = client.monthly_package;

          const postsPct = Math.round((pkg.posts_done / pkg.posts_target) * 100);
          const reelsPct = Math.round((pkg.reels_done / pkg.reels_target) * 100);
          const designsPct = Math.round(
            (pkg.designs_done / pkg.designs_target) * 100
          );

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-card-soft overflow-hidden flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div>
                {/* Top Colored Strip */}
                <div
                  className="h-2.5 w-full"
                  style={{ backgroundColor: client.cover_color }}
                />

                <div className="p-6 space-y-5">
                  {/* Client Title + Package Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100"
                        style={{ backgroundColor: `${client.cover_color}15` }}
                      >
                        {client.logo_url}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {client.sector_label_ar}
                        </span>
                        <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                          {client.name}
                        </h2>
                        <p className="text-xs font-en text-slate-500">
                          {client.name_en}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 inline-block">
                        {pkg.package_name}
                      </span>
                      <p className="text-xs font-en font-bold text-slate-500 mt-1">
                        Retainer: ${pkg.monthly_retainer_usd.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>

                  {/* Monthly Package Deliverables Progress Bars */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>مؤشر إنجاز الباقة الشهرية (Monthly Deliverables):</span>
                      <span className="font-en text-emerald-600">
                        Active ({clientTasks.length} Tasks)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Posts */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">البوستات (Posts)</span>
                          <span className="font-en text-slate-900">
                            {pkg.posts_done}/{pkg.posts_target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${postsPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Reels */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">الريلز (Reels)</span>
                          <span className="font-en text-slate-900">
                            {pkg.reels_done}/{pkg.reels_target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${reelsPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Designs */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600">التصميمات</span>
                          <span className="font-en text-slate-900">
                            {pkg.designs_done}/{pkg.designs_target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${designsPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brand Kit Preview Strip */}
                  {brandKit && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-indigo-600" />
                          ألوان الهوية ونبرة الصوت (Brand Kit Memory):
                        </span>
                        <div className="flex items-center gap-1.5">
                          {brandKit.colors.map((col) => (
                            <div
                              key={col.hex}
                              title={`${col.name} (${col.hex})`}
                              className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 flex items-center gap-1 text-[10px] font-en font-bold"
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.hex}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                        <strong className="text-slate-800">Tone of Voice: </strong>
                        {brandKit.tone_of_voice}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Link to Full Brand Vault & Content Calendar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>
                    ROAS الحملة النشطة:{" "}
                    <strong className="font-en text-emerald-700">
                      {clientCampaigns[0]?.ad_metrics.roas || 5.0}x
                    </strong>
                  </span>
                </div>

                <Link
                  href={`/clients/${client.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  <span>فتح خزنة الهوية وجدول المحتوى (Content Calendar)</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
