"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Palette,
  ShieldAlert,
  Sparkles,
  Target,
  Type,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import {
  cn,
  CONTENT_TYPE_META,
  ROLE_LABELS,
  TASK_STATUS_META,
} from "@/lib/utils";
import { SmartTaskDrawer } from "@/components/workspace/smart-task-drawer";

export default function ClientDetailVaultPage() {
  const params = useParams();
  const clientId = String(params?.id || "client-sweets");
  const { clients, brandKits, campaigns, tasks, users, updateBrandKit } =
    useAppStore();

  const client =
    clients.find((c) => c.id === clientId) || clients[0];
  const brandKit =
    brandKits.find((b) => b.client_id === client.id) || brandKits[0];
  const clientCampaigns = campaigns.filter((c) => c.client_id === client.id);
  const clientTasks = tasks.filter((t) => t.client_id === client.id);

  const [activeTab, setActiveTab] = useState<"vault" | "calendar">("vault");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [editingTone, setEditingTone] = useState(brandKit.tone_of_voice);
  const [savedNotice, setSavedNotice] = useState(false);

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) || null;

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  };

  const handleSaveBrandVoice = () => {
    updateBrandKit(client.id, { tone_of_voice: editingTone });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Client Summary Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-soft space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/clients"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-slate-200"
              style={{ backgroundColor: `${client.cover_color}15` }}
            >
              {client.logo_url}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {client.sector_label_ar}
                </span>
                <span className="text-xs font-en font-semibold text-indigo-600">
                  {client.monthly_package.package_name}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                {client.name}
              </h1>
              <p className="text-xs font-en text-slate-500">{client.name_en}</p>
            </div>
          </div>

          {/* Switch Tabs: Brand Vault vs Content Calendar */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2",
                activeTab === "vault"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Palette className="w-4 h-4" />
              <span>خزنة الهوية والـ AI Memory (Brand Kit)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2",
                activeTab === "calendar"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>جدول المحتوى التفاعلي (Content Calendar)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Brand Kit & AI Memory Vault */}
      {activeTab === "vault" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colors & Fonts Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                <span>الألوان المعتمدة (Brand Hex Codes)</span>
              </h2>
              <p className="text-xs text-slate-500">
                يتم حقن هذه الأكواد تلقائياً في برومبتات مصمم الجرافيك ومونتير الفيديو.
              </p>

              <div className="space-y-3">
                {brandKit.colors.map((c) => (
                  <div
                    key={c.hex}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl border border-slate-200 shadow-inner shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-500">{c.usage}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyHex(c.hex)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-en font-bold text-slate-800 flex items-center gap-1"
                    >
                      {copiedHex === c.hex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{c.hex}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600" />
                <span>الخطوط المعتمدة (Typography)</span>
              </h2>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500">العناوين</p>
                  <p className="text-xs font-bold font-en text-slate-900 mt-1">
                    {brandKit.fonts.heading}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500">النصوص</p>
                  <p className="text-xs font-bold font-en text-slate-900 mt-1">
                    {brandKit.fonts.body}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-slate-500">الإنجليزي</p>
                  <p className="text-xs font-bold font-en text-slate-900 mt-1">
                    {brandKit.fonts.english}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tone of Voice, Target Audience, Do's & Don'ts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>
                    نبرة الصوت والذاكرة الذكية للعميل (Tone of Voice & AI Memory)
                  </span>
                </h2>
                {savedNotice && (
                  <span className="text-xs font-bold text-emerald-600">
                    ✓ تم تحديث ذاكرة الـ AI للعميل
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نبرة الصوت (تُستخدم تلقائياً عند كتابة السكريبتات والكابشنز والردود):
                </label>
                <textarea
                  rows={3}
                  value={editingTone}
                  onChange={(e) => setEditingTone(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSaveBrandVoice}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    حفظ تعديل نبرة الصوت
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    الجمهور المستهدف (Target Audience):
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brandKit.target_audience}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    الميزة التنافسية (USP & Key Messages):
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brandKit.usp_and_key_messages}
                  </p>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <p className="text-xs font-extrabold text-emerald-900">
                    ✅ المسموحات والتوجيهات الإلزامية (DO&apos;s):
                  </p>
                  <ul className="space-y-1.5 text-xs text-emerald-900 list-disc pr-4">
                    {brandKit.dos_and_donts.dos.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
                  <p className="text-xs font-extrabold text-red-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    المحظورات الصارمة (DON&apos;Ts - يمنع الـ AI من استخدامها):
                  </p>
                  <ul className="space-y-1.5 text-xs text-red-900 list-disc pr-4">
                    {brandKit.dos_and_donts.donts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Visual Prompt Style Prefix */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-1.5">
                <p className="text-xs font-bold text-indigo-300 font-en">
                  AI Visual Style Prompt Prefix (Auto-injected for Graphic Designer):
                </p>
                <p className="text-xs font-en text-slate-300 leading-relaxed" dir="ltr">
                  {brandKit.visual_style_prompt_prefix}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Client Content Calendar */}
      {activeTab === "calendar" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                جدول المحتوى التفاعلي لـ {client.name} (Content Calendar - نوفمبر 2026)
              </h2>
              <p className="text-xs text-slate-500">
                عرض زمني لجميع البوستات، الريلز، والحملات المجدولة مع حالتها الحالية. اضغط على أي عنصر لفتح درج المهمة والمساعد الذكي.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-600 bg-slate-50">
                  <th className="p-3.5 rounded-r-xl">تاريخ النشر المجدول</th>
                  <th className="p-3.5">عنوان المحتوى / المهمة</th>
                  <th className="p-3.5">نوع المحتوى والمنصة</th>
                  <th className="p-3.5">المسؤول والدور</th>
                  <th className="p-3.5">الحالة (Status)</th>
                  <th className="p-3.5 rounded-l-xl">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {clientTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigned_to);
                  const statusMeta = TASK_STATUS_META[task.status];
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition"
                    >
                      <td className="p-3.5 font-en font-bold text-slate-800 whitespace-nowrap">
                        📅 {task.scheduled_publish_date}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {task.title}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-en font-semibold">
                          {CONTENT_TYPE_META[task.content_type]?.label_ar} •{" "}
                          {task.platform}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {assignee && (
                            <img
                              src={assignee.avatar_url}
                              alt={assignee.full_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="font-semibold text-slate-800">
                            {assignee?.full_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({ROLE_LABELS[task.role_slug]?.ar})
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full border text-[11px] font-bold",
                            statusMeta.colorClass
                          )}
                        >
                          {statusMeta.label_ar}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-indigo-600 font-bold hover:underline">
                          فتح في المساعد الذكي ←
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SmartTaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
