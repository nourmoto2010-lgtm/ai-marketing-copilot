"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sparkles,
  UserCheck,
  Wand2,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import { ROLE_LABELS } from "@/lib/utils";

interface AiTaskSplitterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiTaskSplitterModal({
  isOpen,
  onClose,
}: AiTaskSplitterModalProps) {
  const {
    clients,
    brandKits,
    users,
    geminiApiKey,
    addSplitCampaignTasks,
  } = useAppStore();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || "client-sweets"
  );
  const [campaignTitle, setCampaignTitle] = useState(
    "حملة عروض نهاية الأسبوع وبوكسات العائلة"
  );
  const [campaignObjective, setCampaignObjective] = useState(
    "Direct Sales & Reels Engagement (ROAS > 5x)"
  );
  const [campaignBrief, setCampaignBrief] = useState(
    "نريد إطلاق حملة سريعة لمدة 5 أيام تركز على فيديو Reels جذاب وبوست Carousel يعرض مكونات البوكس مع حملة إعلانية ممولة وخطة ردود فورية لتحويل الرسائل إلى مبيعات."
  );
  const [isSplitting, setIsSplitting] = useState(false);
  const [previewTasks, setPreviewTasks] = useState<any[]>([]);

  if (!isOpen) return null;

  const client =
    clients.find((c) => c.id === selectedClientId) || clients[0];
  const brandKit =
    brandKits.find((b) => b.client_id === client.id) || brandKits[0];

  const handleGenerateBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSplitting(true);

    try {
      const res = await fetch("/api/ai/campaign-split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client,
          brandKit,
          campaignTitle,
          campaignObjective,
          campaignBrief,
          teamMembers: users,
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        setPreviewTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleConfirmCreate = () => {
    if (previewTasks.length === 0) return;
    addSplitCampaignTasks({
      clientId: client.id,
      campaignTitle,
      campaignObjective,
      campaignBrief,
      generatedTasks: previewTasks,
    });
    setPreviewTasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-ai-gradient text-white flex items-center justify-center shadow-ai-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                محرك تحويل الحملة إلى مهام موزعة بالذكاء الاصطناعي (AI Campaign Breakdown)
              </h2>
              <p className="text-xs text-slate-500">
                يقرأ الـ AI هوية العميل ويقسم الفكرة تلقائياً إلى سلسلة مهام مترابطة (Content → Design → Video → Media Buying → Moderation).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerateBreakdown} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اختر العميل (يتم استدعاء Brand Kit تلقائياً):
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setPreviewTasks([]);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.logo_url} {c.name} — ({c.sector_label_ar})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الهدف التسويقي للحملة (Campaign Objective):
              </label>
              <input
                type="text"
                value={campaignObjective}
                onChange={(e) => setCampaignObjective(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-en font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان الحملة التسويقية:
            </label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              البريف العام أو طلب العميل (Campaign Brief):
            </label>
            <textarea
              rows={3}
              value={campaignBrief}
              onChange={(e) => setCampaignBrief(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-500">
              نبرة صوت العميل المحقونة:{" "}
              <span className="font-bold text-slate-700">
                {brandKit.tone_of_voice.slice(0, 75)}...
              </span>
            </div>

            <button
              type="submit"
              disabled={isSplitting}
              className="px-5 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>
                {isSplitting
                  ? "جاري تحليل الحملة وتوزيع الأدوار..."
                  : "تقسيم الحملة إلى سلسلة مهام بالـ AI"}
              </span>
            </button>
          </div>
        </form>

        {/* Preview Generated Pipeline */}
        {previewTasks.length > 0 && (
          <div className="space-y-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>
                  سلسلة المهام المقترحة ({previewTasks.length} مهام مترابطة جاهزة للتوزيع):
                </span>
              </h3>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                ✓ تم ربط التبعيات والمواعيد النهائية تلقائياً
              </span>
            </div>

            <div className="space-y-2.5">
              {previewTasks.map((pt, index) => {
                const assignee = users.find((u) => u.id === pt.assigned_to);
                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-en font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {pt.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                            ROLE_LABELS[pt.role_slug as keyof typeof ROLE_LABELS]
                              ?.badgeClass || ""
                          }`}
                        >
                          {
                            ROLE_LABELS[pt.role_slug as keyof typeof ROLE_LABELS]
                              ?.ar
                          }
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 pr-7">
                        {pt.brief}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pr-7 sm:pr-0">
                      {assignee && (
                        <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <img
                            src={assignee.avatar_url}
                            alt={assignee.full_name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {assignee.full_name}
                          </span>
                        </div>
                      )}
                      <span className="text-[11px] font-en font-semibold text-slate-500">
                        +{pt.days_until_deadline}d • {pt.estimated_hours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewTasks([])}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إعادة الضبط
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد وإضافة المهام الـ 5 إلى لوحة الـ Kanban فوراً</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
