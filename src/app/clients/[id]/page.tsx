"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Palette,
  Save,
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
  const {
    clients,
    brandKits,
    tasks,
    users,
    updateClientAndBrandKit,
  } = useAppStore();

  const client =
    clients.find((c) => c.id === clientId) || clients[0];
  const brandKit =
    brandKits.find((b) => b.client_id === client.id) || brandKits[0];
  const clientTasks = tasks.filter((t) => t.client_id === client.id);

  const [activeTab, setActiveTab] = useState<"vault" | "calendar">("vault");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Full editable state for Client Info, Package, and Brand Kit
  const [editClientName, setEditClientName] = useState(client.name);
  const [editSectorLabel, setEditSectorLabel] = useState(
    client.sector_label_ar
  );
  const [editPostsTarget, setEditPostsTarget] = useState(
    client.monthly_package.posts_target
  );
  const [editReelsTarget, setEditReelsTarget] = useState(
    client.monthly_package.reels_target
  );
  const [editDesignsTarget, setEditDesignsTarget] = useState(
    client.monthly_package.designs_target
  );
  const [editRetainer, setEditRetainer] = useState(
    client.monthly_package.monthly_retainer_usd
  );

  const [editingTone, setEditingTone] = useState(brandKit.tone_of_voice);
  const [editingTarget, setEditingTarget] = useState(brandKit.target_audience);
  const [editingUsp, setEditingUsp] = useState(brandKit.usp_and_key_messages);
  const [editingDos, setEditingDos] = useState(
    brandKit.dos_and_donts.dos.join("\n")
  );
  const [editingDonts, setEditingDonts] = useState(
    brandKit.dos_and_donts.donts.join("\n")
  );
  const [editingColors, setEditingColors] = useState(brandKit.colors);
  const [savedNotice, setSavedNotice] = useState(false);

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) || null;

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  };

  const handleSaveAllClientData = async () => {
    await updateClientAndBrandKit({
      clientId: client.id,
      name: editClientName,
      sector_label_ar: editSectorLabel,
      monthly_package: {
        posts_target: Number(editPostsTarget),
        reels_target: Number(editReelsTarget),
        designs_target: Number(editDesignsTarget),
        monthly_retainer_usd: Number(editRetainer),
      },
      brandKit: {
        colors: editingColors,
        tone_of_voice: editingTone,
        target_audience: editingTarget,
        usp_and_key_messages: editingUsp,
        dos_and_donts: {
          dos: editingDos
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          donts: editingDonts
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      },
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
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
              <span>تعديل بيانات العميل والـ Brand Kit</span>
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
              <span>جدول المحتوى والمهام ({clientTasks.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Editable Client Data & Brand Kit Vault */}
      {activeTab === "vault" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info, Package Targets, and Colors */}
          <div className="space-y-6">
            {/* Client Info & Package Targets */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>بيانات العميل ومطلوبات الباقة الشهرية</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم العميل:
                  </label>
                  <input
                    type="text"
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القطاع:
                  </label>
                  <input
                    type="text"
                    value={editSectorLabel}
                    onChange={(e) => setEditSectorLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      عدد البوستات المطلوبة:
                    </label>
                    <input
                      type="number"
                      value={editPostsTarget}
                      onChange={(e) =>
                        setEditPostsTarget(Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-en font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      عدد الريلز المطلوبة:
                    </label>
                    <input
                      type="number"
                      value={editReelsTarget}
                      onChange={(e) =>
                        setEditReelsTarget(Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-en font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      عدد التصميمات:
                    </label>
                    <input
                      type="number"
                      value={editDesignsTarget}
                      onChange={(e) =>
                        setEditDesignsTarget(Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-en font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      قيمة التعاقد ($):
                    </label>
                    <input
                      type="number"
                      value={editRetainer}
                      onChange={(e) => setEditRetainer(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-en font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Colors */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                <span>تعديل ألوان الهوية (Hex Color Pickers)</span>
              </h2>

              <div className="space-y-3">
                {editingColors.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => {
                          const next = [...editingColors];
                          next[idx] = { ...next[idx], hex: e.target.value };
                          setEditingColors(next);
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer shrink-0"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const next = [...editingColors];
                            next[idx] = { ...next[idx], name: e.target.value };
                            setEditingColors(next);
                          }}
                          className="w-full text-xs font-bold text-slate-900 border-b border-slate-100 focus:outline-none"
                        />
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
          </div>

          {/* Right 2 Columns: Tone of Voice, Target Audience, USP, Do's & Don'ts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>
                    تعديل الهوية والرسائل التسويقية والمحظورات (تُحفظ فوراً في Supabase)
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  {savedNotice && (
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ تم حفظ جميع تعديلات العميل!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveAllClientData}
                    className="px-5 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ جميع تعديلات العميل والباقة</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نبرة الصوت (Tone of Voice):
                </label>
                <textarea
                  rows={2}
                  value={editingTone}
                  onChange={(e) => setEditingTone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الجمهور المستهدف (Target Audience):
                  </label>
                  <textarea
                    rows={3}
                    value={editingTarget}
                    onChange={(e) => setEditingTarget(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الميزة التنافسية والمطلوب إبرازه (USP & Key Messages):
                  </label>
                  <textarea
                    rows={3}
                    value={editingUsp}
                    onChange={(e) => setEditingUsp(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1.5">
                    ✅ المسموحات والتوجيهات الإلزامية (DO&apos;s - سطر لكل عنصر):
                  </label>
                  <textarea
                    rows={4}
                    value={editingDos}
                    onChange={(e) => setEditingDos(e.target.value)}
                    className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-800 mb-1.5">
                    🚫 المحظورات الصارمة (DON&apos;Ts - سطر لكل عنصر):
                  </label>
                  <textarea
                    rows={4}
                    value={editingDonts}
                    onChange={(e) => setEditingDonts(e.target.value)}
                    className="w-full p-3 rounded-xl border border-red-200 bg-red-50/30 text-xs leading-relaxed"
                  />
                </div>
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
                جدول المحتوى والمهام لـ {client.name}
              </h2>
              <p className="text-xs text-slate-500">
                اضغط على أي مهمة لتعديل البريف، إضافة سؤال للفريق، أو تشغيل المساعد الذكي.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-600 bg-slate-50">
                  <th className="p-3.5 rounded-r-xl">تاريخ النشر</th>
                  <th className="p-3.5">عنوان المحتوى / المهمة</th>
                  <th className="p-3.5">نوع المحتوى والمنصة</th>
                  <th className="p-3.5">المسؤول</th>
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
                        <span className="font-bold text-slate-900">
                          {assignee?.full_name}
                        </span>
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
                          تعديل / نقاش / Copilot ←
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
