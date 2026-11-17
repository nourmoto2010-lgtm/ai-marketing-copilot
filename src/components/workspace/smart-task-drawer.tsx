"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Task } from "@/types/database";
import { useAppStore } from "@/lib/store/app-context";
import {
  cn,
  CONTENT_TYPE_META,
  PRIORITY_META,
  ROLE_LABELS,
  TASK_STATUS_META,
} from "@/lib/utils";
import { RoleCopilotPanel } from "./role-copilot-panel";

interface SmartTaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

export function SmartTaskDrawer({ task, onClose }: SmartTaskDrawerProps) {
  const {
    clients,
    brandKits,
    users,
    roles,
    currentRole,
    reassignTask,
    updateTaskDeliverable,
    submitTaskForReview,
    reviewTask,
  } = useAppStore();

  const [deliverableText, setDeliverableText] = useState("");
  const [designPromptEn, setDesignPromptEn] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(9.5);
  const [reviewNotes, setReviewNotes] = useState<string>(
    "ممتاز ومطابق لهوية العميل بالكامل، تم الاعتماد من أول مرة."
  );
  const [savedToast, setSavedToast] = useState(false);

  React.useEffect(() => {
    if (task) {
      setDeliverableText(
        task.deliverable_content.script_or_caption ||
          (task.deliverable_content.ad_recommendations || []).join("\n") ||
          ""
      );
      setDesignPromptEn(task.deliverable_content.design_prompt_en || "");
    }
  }, [task]);

  if (!task) return null;

  const client = clients.find((c) => c.id === task.client_id) || clients[0];
  const brandKit =
    brandKits.find((b) => b.client_id === client.id) || brandKits[0];
  const assignee = users.find((u) => u.id === task.assigned_to) || users[0];
  const effectiveRoleSlug = assignee.role_slug || task.role_slug;
  const taskRole =
    roles.find((r) => r.slug === effectiveRoleSlug) || roles[2];
  const statusMeta = TASK_STATUS_META[task.status];
  const priorityMeta = PRIORITY_META[task.priority];

  const handleSaveDeliverable = () => {
    updateTaskDeliverable(task.id, {
      script_or_caption: deliverableText,
      design_prompt_en: designPromptEn || undefined,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  const handleApplyCopilotOutput = (generatedText: string) => {
    const nextText = deliverableText
      ? `${deliverableText}\n\n---\n${generatedText}`
      : generatedText;
    setDeliverableText(nextText);
    updateTaskDeliverable(task.id, {
      script_or_caption: nextText,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-4xl h-full overflow-y-auto shadow-2xl border-r border-slate-200 flex flex-col justify-between">
        {/* Drawer Sticky Header */}
        <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-20 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                <span>{client.logo_url}</span>
                <span>{client.name}</span>
              </span>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold border",
                  statusMeta.colorClass
                )}
              >
                {statusMeta.label_ar} ({statusMeta.label_en})
              </span>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold border",
                  priorityMeta.className
                )}
              >
                الأولوية: {priorityMeta.label_ar}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-en font-semibold bg-slate-100 text-slate-700">
                {CONTENT_TYPE_META[task.content_type]?.label_ar} • {task.platform}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Task Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={assignee.avatar_url}
                alt={assignee.full_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-500">
                  الموظف المسند إليه التاسك (يحدد أدوات الـ Copilot):
                </p>
                <select
                  value={assignee.id}
                  onChange={(e) => reassignTask(task.id, e.target.value)}
                  className="mt-0.5 w-full bg-white text-slate-900 text-xs font-extrabold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {users
                    .filter((u) => u.role_slug !== "ceo")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} — {ROLE_LABELS[u.role_slug]?.ar}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-[11px] text-slate-500">
                  موعد التسليم / النشر المجدول:
                </p>
                <p className="text-xs font-bold font-en text-slate-900">
                  Publish: {task.scheduled_publish_date}
                </p>
                <p className="text-[11px] text-slate-500 font-en">
                  Est. {task.estimated_hours}h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[11px] text-slate-500">
                  مؤشر القبول من أول مرة:
                </p>
                <p className="text-xs font-bold text-slate-900">
                  عدد التعديلات المسجلة:{" "}
                  <span
                    className={cn(
                      "font-en font-extrabold",
                      task.revision_count === 0
                        ? "text-emerald-600"
                        : "text-amber-600"
                    )}
                  >
                    {task.revision_count}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">
                  {task.revision_count === 0
                    ? "مؤهل لنقاط First-Time Approval الكاملة"
                    : "تم طلب تعديل سابق"}
                </p>
              </div>
            </div>
          </div>

          {/* Task Brief Section */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase">
              بريف المهمة والتوجيه التنفيذي (Task Creative Brief)
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {task.brief}
            </p>
            {task.deliverable_content.notes && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>ملاحظات المراجع (Account Manager / Director):</strong>{" "}
                  {task.deliverable_content.notes}
                </div>
              </div>
            )}
          </div>

          {/* Embedded Role-Specific AI Copilot */}
          <RoleCopilotPanel
            task={task}
            assignee={assignee}
            client={client}
            brandKit={brandKit}
            role={taskRole}
            onApplyToDeliverable={handleApplyCopilotOutput}
          />

          {/* Deliverable Workspace Editor */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>مخرجات وتسليم المهمة (Task Deliverable Workspace)</span>
              </h3>
              {savedToast && (
                <span className="text-xs font-bold text-emerald-600">
                  ✓ تم حفظ التسليم بنجاح
                </span>
              )}
            </div>

            {task.deliverable_content.hook_options &&
              task.deliverable_content.hook_options.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="text-xs font-bold text-slate-700">
                    الهوكات المقترحة (Scroll-Stopping Hooks):
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {task.deliverable_content.hook_options.map((h, i) => (
                      <li key={i} className="font-medium">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                السكريبت / الكابشن / خطة التنفيذ النهائية:
              </label>
              <textarea
                rows={5}
                value={deliverableText}
                onChange={(e) => setDeliverableText(e.target.value)}
                placeholder="اكتب مخرجات المهمة هنا أو اضغط 'اعتماد وحفظ' من مخرجات المساعد الذكي أعلاه..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {(task.role_slug === "graphic_designer" || designPromptEn) && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-en">
                  AI Visual Prompt (Midjourney v6 / Flux 4K Prompt):
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={designPromptEn}
                  onChange={(e) => setDesignPromptEn(e.target.value)}
                  placeholder="Commercial 4k prompt..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-en bg-slate-900 text-indigo-200 focus:outline-none"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDeliverable}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700"
              >
                حفظ مسودة العمل
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSaveDeliverable();
                    submitTaskForReview(task.id, {
                      simulateLateDelivery: true,
                    });
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>محاكاة تسليم متأخر (Late Delivery)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveDeliverable();
                    submitTaskForReview(task.id, {
                      simulateLateDelivery: false,
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تسليم في الموعد للمراجعة (On-Time Submit)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Manager / CEO Review & Approval Box */}
          {currentRole.permissions.can_approve && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      قرار مراجعة واعتماد المهمة (Account Manager / Director Review)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    اعتمادك للمهمة من أول مرة يرفع مؤشر الـ First-Time Approval للموظف ويحدث باقة العميل تلقائياً.
                  </p>
                </div>
                <span className="text-xs font-en px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300">
                  KPI Evaluator Linked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    تقييم جودة المخرج (من 10):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.1}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-en font-bold text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">
                    ملاحظات المراجعة أو التعديلات المطلوبة:
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reviewTask({
                      taskId: task.id,
                      decision: "revision_requested",
                      qualityRating: Math.min(reviewRating, 7.8),
                      feedbackNotes: reviewNotes,
                    });
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>طلب تعديل (Request Revision)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reviewTask({
                      taskId: task.id,
                      decision: "approved",
                      qualityRating: reviewRating,
                      feedbackNotes: reviewNotes,
                    });
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد المخرج النهائي (Approve Deliverable)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
