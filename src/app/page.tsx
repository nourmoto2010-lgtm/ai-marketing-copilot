"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/lib/store/app-context";
import { cn, ROLE_LABELS, TASK_STATUS_META } from "@/lib/utils";
import { PerformanceScore, User } from "@/types/database";

export default function DirectorDashboardPage() {
  const {
    users,
    currentUser,
    currentRole,
    tasks,
    reviews,
    performanceScores,
    kpiEventsLog,
    clients,
    selectedClientFilter,
    geminiApiKey,
    refreshMemberPerformance,
  } = useAppStore();

  const [evaluatingUserId, setEvaluatingUserId] = useState<string | null>(null);
  const [selectedMemberModal, setSelectedMemberModal] = useState<{
    user: User;
    score: PerformanceScore;
  } | null>(null);

  const filteredTasks =
    selectedClientFilter === "all"
      ? tasks
      : tasks.filter((t) => t.client_id === selectedClientFilter);

  const activeTasksCount = filteredTasks.filter((t) =>
    ["in_progress", "in_review", "backlog"].includes(t.status)
  ).length;

  const revisionOrDelayedCount = filteredTasks.filter(
    (t) => t.status === "revision_requested"
  ).length;

  const avgOnTimeRate = Math.round(
    performanceScores.reduce((acc, s) => acc + s.on_time_delivery_rate, 0) /
      performanceScores.length
  );

  const avgFirstTimeApproval = Math.round(
    performanceScores.reduce((acc, s) => acc + s.first_time_approval_rate, 0) /
      performanceScores.length
  );

  // If member role (not CEO / AM), prioritize their own scorecard at the top
  const visibleScores = currentRole.permissions.can_view_all_scores
    ? performanceScores
    : performanceScores.filter((p) => p.user_id === currentUser.id);

  const chartData = performanceScores.map((ps) => {
    const member = users.find((u) => u.id === ps.user_id);
    return {
      name: member ? member.full_name.split(" ")[0] : ps.user_id,
      fullName: member?.full_name || "",
      score: ps.overall_score,
      firstTime: ps.first_time_approval_rate,
      onTime: ps.on_time_delivery_rate,
    };
  });

  const handleRunAiEvaluation = async (userId: string) => {
    const member = users.find((u) => u.id === userId);
    if (!member) return;
    setEvaluatingUserId(userId);

    try {
      const memberTasks = tasks.filter((t) => t.assigned_to === userId);
      const memberTaskIds = new Set(memberTasks.map((t) => t.id));
      const memberReviews = reviews.filter((r) => memberTaskIds.has(r.task_id));

      const res = await fetch("/api/ai/evaluate-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member,
          completedTasks: memberTasks,
          reviews: memberReviews,
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        refreshMemberPerformance(userId, data.evaluation);
      }
    } catch (e) {
      refreshMemberPerformance(userId);
    } finally {
      setEvaluatingUserId(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentRole.permissions.can_view_all_scores
                ? "مركز القيادة وتقييم الأداء الذكي (Director Dashboard & AI Team Scorecard)"
                : `لوحة الأداء والمهام الشخصية — ${currentUser.full_name}`}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {currentRole.permissions.can_view_all_scores
              ? "مؤشرات عمليات الوكالة وبطاقات تقييم الفريق"
              : `مرحباً ${currentUser.full_name}، إليك مؤشرات أدائك ومهامك اليوم`}
          </h1>
          <p className="text-sm text-slate-500">
            يتم احتساب النقاط موضوعياً من 100 بناءً على: الالتزام بالمواعيد (30%)، القبول من أول مرة بدون تعديلات (30%)، جودة المخرجات (25%)، وسرعة الإنجاز (15%).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/workspace"
            className="px-4 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow hover:opacity-95 transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>فتح مساحة العمل ومقسم المهام الذكي</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              المهام الجارية وقيد المراجعة
            </p>
            <p className="text-3xl font-extrabold font-en text-slate-900">
              {activeTasksCount}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
              موزعة على {clients.length} عملاء نشطين
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              معدل التسليم في الموعد (On-Time Delivery)
            </p>
            <p className="text-3xl font-extrabold font-en text-emerald-600">
              {avgOnTimeRate}%
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2% عن الأسبوع الماضي
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              معدل القبول من أول مرة (First-Time Approval)
            </p>
            <p className="text-3xl font-extrabold font-en text-indigo-600">
              {avgFirstTimeApproval}%
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-semibold">
              مدعوم بـ Brand Kit Copilot
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-soft flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500">
              مهام بطلب تعديل (Revisions Needed)
            </p>
            <p className="text-3xl font-extrabold font-en text-amber-600">
              {revisionOrDelayedCount}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
              متوسط التعديلات: 0.12 / تاسك
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Chart + Quick Role Tasks Summary */}
      {currentRole.permissions.can_view_all_scores && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  مقارنة نقاط الأداء والقبول من أول مرة للفريق (Team KPI Benchmark)
                </h2>
                <p className="text-xs text-slate-500">
                  مقارنة الدرجة الإجمالية (من 100) مع نسبة القبول من أول مرة بدون تعديلات (%)
                </p>
              </div>
              <span className="text-xs font-en font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                Nov 2026 - Week 3
              </span>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    name="Overall AI Score (/100)"
                    radius={[6, 6, 0, 0]}
                    fill="#6366F1"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.score >= 92 ? "#10B981" : "#6366F1"}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="firstTime"
                    name="First-Time Approval (%)"
                    radius={[6, 6, 0, 0]}
                    fill="#2563EB"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Approvals Box for CEO / Account Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  مخرجات بانتظار اعتمادك الآن
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                  {tasks.filter((t) => t.status === "in_review").length} مهام
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                مراجعة التسليمات تؤثر فورياً على مؤشر الـ First-Time Approval لكل موظف.
              </p>

              <div className="space-y-3">
                {tasks
                  .filter((t) =>
                    ["in_review", "revision_requested"].includes(t.status)
                  )
                  .slice(0, 4)
                  .map((task) => {
                    const client = clients.find((c) => c.id === task.client_id);
                    const assignee = users.find(
                      (u) => u.id === task.assigned_to
                    );
                    const statusMeta = TASK_STATUS_META[task.status];
                    return (
                      <Link
                        key={task.id}
                        href="/workspace"
                        className="block p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-600">
                            {client?.logo_url} {client?.name}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                              statusMeta.colorClass
                            )}
                          >
                            {statusMeta.label_ar}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          المنفذ: {assignee?.full_name} ({ROLE_LABELS[task.role_slug]?.en})
                        </p>
                      </Link>
                    );
                  })}
              </div>
            </div>

            <Link
              href="/workspace"
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition"
            >
              الانتقال لمراجعة واعتماد المهام ←
            </Link>
          </div>
        </div>
      )}

      {/* AI Team Evaluator Scorecard Grid */}
      {kpiEventsLog.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>
                سجل التحديث التلقائي الحظي لنقاط الأداء (Real-Time Task-to-KPI Event Stream)
              </span>
            </h2>
            <span className="text-[11px] font-en font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Auto-Synced with Kanban & Reviews
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {kpiEventsLog.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {evt.userName} — <span className="text-slate-600">{evt.taskTitle}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-1">
                    {evt.summaryAr}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-en font-extrabold text-xs shrink-0 border",
                    evt.delta > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : evt.delta < 0
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  )}
                >
                  {evt.previousScore} → {evt.newScore} (
                  {evt.delta >= 0 ? `+${evt.delta}` : evt.delta})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>
                بطاقات التقييم الذكي لأعضاء الفريق (AI Team Performance Evaluator)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              يحلل وكيل التقييم الذكي التزام كل عضو بالمواعيد، جودة التسليم من أول مرة، وسرعة التنفيذ، ويستنتج نقاط القوة والتحسين أسبوعياً.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleScores.map((score) => {
            const member = users.find((u) => u.id === score.user_id);
            if (!member) return null;

            const isExcellent = score.overall_score >= 92;
            const isEvaluating = evaluatingUserId === member.id;

            return (
              <div
                key={score.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card-soft p-5 flex flex-col justify-between hover:border-indigo-300 transition"
              >
                <div>
                  {/* Member Top Info + Score Circle */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {member.full_name}
                        </h3>
                        <span
                          className={cn(
                            "inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border mt-0.5",
                            ROLE_LABELS[member.role_slug]?.badgeClass
                          )}
                        >
                          {ROLE_LABELS[member.role_slug]?.ar} •{" "}
                          <span className="font-en">
                            {ROLE_LABELS[member.role_slug]?.en}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Score Badge out of 100 */}
                    <div
                      className={cn(
                        "px-3 py-2 rounded-2xl text-center border shrink-0",
                        isExcellent
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-indigo-50 border-indigo-200 text-indigo-700"
                      )}
                    >
                      <div className="text-xl font-extrabold font-en leading-none">
                        {score.overall_score}
                        <span className="text-xs font-normal">/100</span>
                      </div>
                      <div className="text-[10px] font-bold mt-0.5">
                        {isExcellent ? "أداء استثنائي" : "أداء متميز"}
                      </div>
                    </div>
                  </div>

                  {/* 4 Sub-metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 my-4">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] text-slate-500">
                        الالتزام بالموعد (On-Time)
                      </p>
                      <p className="text-sm font-extrabold font-en text-slate-900 mt-0.5">
                        {score.on_time_delivery_rate}%
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] text-slate-500">
                        القبول من أول مرة
                      </p>
                      <p className="text-sm font-extrabold font-en text-emerald-600 mt-0.5">
                        {score.first_time_approval_rate}%
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] text-slate-500">
                        المهام المنجزة
                      </p>
                      <p className="text-sm font-extrabold font-en text-slate-900 mt-0.5">
                        {score.tasks_completed} تاسك
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] text-slate-500">
                        متوسط التعديلات / تاسك
                      </p>
                      <p className="text-sm font-extrabold font-en text-indigo-600 mt-0.5">
                        {score.avg_revisions_per_task}
                      </p>
                    </div>
                  </div>

                  {/* AI Weekly Summary & Strengths */}
                  <div className="p-3.5 rounded-xl bg-ai-subtle border border-indigo-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        استنتاج الـ AI الأسبوعي:
                      </span>
                      <span className="text-[10px] font-en text-indigo-600 font-semibold">
                        AI Evaluator
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {score.ai_weekly_summary}
                    </p>

                    <div className="pt-1 space-y-1">
                      <p className="text-[11px] font-bold text-emerald-800">
                        ✓ أبرز نقاط القوة:
                      </p>
                      <ul className="text-[11px] text-slate-600 space-y-1 pr-3 list-disc">
                        {score.ai_strengths.slice(0, 2).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {score.ai_improvements.length > 0 && (
                      <div className="pt-1 space-y-1">
                        <p className="text-[11px] font-bold text-amber-800">
                          ⚡ توصية التحسين:
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {score.ai_improvements[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      setSelectedMemberModal({ user: member, score })
                    }
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                  >
                    عرض التفاصيل الكاملة ←
                  </button>

                  <button
                    onClick={() => handleRunAiEvaluation(member.id)}
                    disabled={isEvaluating}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn(
                        "w-3.5 h-3.5",
                        isEvaluating && "animate-spin"
                      )}
                    />
                    <span>
                      {isEvaluating ? "جاري التقييم..." : "تحديث التقييم بالـ AI"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Performance Modal */}
      {selectedMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMemberModal.user.avatar_url}
                  alt={selectedMemberModal.user.full_name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {selectedMemberModal.user.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMemberModal.user.job_title_ar}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedMemberModal.user.specialty_tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-en px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-left">
                <span className="text-2xl font-extrabold font-en text-emerald-600">
                  {selectedMemberModal.score.overall_score}/100
                </span>
                <p className="text-[11px] text-slate-400">
                  {selectedMemberModal.score.period_label}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">الالتزام بالموعد</p>
                <p className="text-lg font-extrabold font-en text-slate-900">
                  {selectedMemberModal.score.on_time_delivery_rate}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">القبول من أول مرة</p>
                <p className="text-lg font-extrabold font-en text-emerald-600">
                  {selectedMemberModal.score.first_time_approval_rate}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">جودة المخرجات</p>
                <p className="text-lg font-extrabold font-en text-indigo-600">
                  {selectedMemberModal.score.quality_score}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">كفاءة السرعة</p>
                <p className="text-lg font-extrabold font-en text-blue-600">
                  {selectedMemberModal.score.speed_efficiency_score}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                نقاط القوة المستنتجة بالذكاء الاصطناعي:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                {selectedMemberModal.score.ai_strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                فرص التحسين الموصى بها للأسبوع القادم:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                {selectedMemberModal.score.ai_improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMemberModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
