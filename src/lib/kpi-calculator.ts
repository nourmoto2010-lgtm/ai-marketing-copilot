// ============================================================================
// AI Performance & KPI Objective Calculator (src/lib/kpi-calculator.ts)
// ============================================================================
// يحسب النتيجة الموضوعية لكل عضو من 100 بناءً على 4 معايير موزونة:
// 1. الالتزام بالمواعيد (On-Time Delivery Rate) -> وزن 30%
// 2. قبول العمل من أول مرة بدون تعديلات (First-Time Approval Rate) -> وزن 30%
// 3. جودة المخرجات حسب تقييم المراجع (Quality Score) -> وزن 25%
// 4. سرعة وكفاءة التنفيذ (Speed Efficiency Score) -> وزن 15%
// ============================================================================

import { KpiWeightsConfig, Task, TaskReview, User } from "@/types/database";

export const DEFAULT_KPI_WEIGHTS: KpiWeightsConfig = {
  on_time_weight: 40,
  first_time_approval_weight: 35,
  speed_quality_weight: 25,
};

export interface ObjectiveKpiBreakdown {
  overall_score: number;
  on_time_delivery_rate: number;
  first_time_approval_rate: number;
  quality_score: number;
  speed_efficiency_score: number;
  tasks_completed: number;
  avg_revisions_per_task: number;
  ai_strengths: string[];
  ai_improvements: string[];
  ai_weekly_summary: string;
}

export interface KpiScoreEventNotification {
  id: string;
  userId: string;
  userName: string;
  taskTitle: string;
  eventType: "on_time_submission" | "late_submission" | "revision_requested" | "final_approval";
  previousScore: number;
  newScore: number;
  delta: number;
  summaryAr: string;
  timestamp: string;
}

export function calculateMemberKpiScore(
  memberTasks: Task[],
  memberReviews: TaskReview[],
  member?: User,
  customWeights?: KpiWeightsConfig
): ObjectiveKpiBreakdown {
  const weights = customWeights || DEFAULT_KPI_WEIGHTS;
  const totalW =
    weights.on_time_weight +
      weights.first_time_approval_weight +
      weights.speed_quality_weight || 100;
  const wOnTime = weights.on_time_weight / totalW;
  const wFirstTime = weights.first_time_approval_weight / totalW;
  const wSpeedQuality = weights.speed_quality_weight / totalW;
  const completedOrReviewed = memberTasks.filter((t) =>
    ["approved", "published", "in_review", "revision_requested"].includes(t.status)
  );

  if (completedOrReviewed.length === 0) {
    return {
      overall_score: 88,
      on_time_delivery_rate: 90,
      first_time_approval_rate: 85,
      quality_score: 88,
      speed_efficiency_score: 90,
      tasks_completed: 0,
      avg_revisions_per_task: 0,
      ai_strengths: ["جاهزية عالية لاستلام المهام الجديدة والالتزام بهوية العملاء."],
      ai_improvements: ["إتمام وتسليم المهام الجارية لبدء احتساب المؤشرات الأسبوعية."],
      ai_weekly_summary: "لا توجد مهام مسلمة بعد في هذه الفترة.",
    };
  }

  // 1. On-Time Delivery Rate (30% weight)
  const onTimeCount = completedOrReviewed.filter((t) => {
    const checkDate = t.delivered_at ? new Date(t.delivered_at) : new Date();
    return checkDate.getTime() <= new Date(t.deadline).getTime();
  }).length;
  const on_time_delivery_rate = Math.round(
    (onTimeCount / completedOrReviewed.length) * 100
  );

  // 2. First-Time Approval Rate (30% weight — revision_count === 0)
  const firstTimeCount = completedOrReviewed.filter(
    (t) => t.revision_count === 0
  ).length;
  const first_time_approval_rate = Math.round(
    (firstTimeCount / completedOrReviewed.length) * 100
  );

  // 3. Average Revisions per task
  const totalRevisions = completedOrReviewed.reduce(
    (acc, t) => acc + t.revision_count,
    0
  );
  const avg_revisions_per_task = Number(
    (totalRevisions / completedOrReviewed.length).toFixed(2)
  );

  // 4. Quality Score (25% weight — from reviews 1-10 scaled to 100, with revision penalty)
  let quality_score = 92;
  if (memberReviews.length > 0) {
    const avgRating =
      memberReviews.reduce((acc, r) => acc + r.quality_rating, 0) /
      memberReviews.length;
    quality_score = Math.round(avgRating * 10);
  } else {
    quality_score = Math.max(68, 95 - Math.round(avg_revisions_per_task * 9));
  }

  // 5. Speed Efficiency Score (15% weight — estimated_hours vs actual_hours)
  const speedRatios = completedOrReviewed.map((t) => {
    const actual = t.actual_hours || t.estimated_hours;
    if (actual <= t.estimated_hours) return 100;
    const overrunRatio = t.estimated_hours / actual;
    return Math.max(60, Math.round(overrunRatio * 100));
  });
  const speed_efficiency_score = Math.round(
    speedRatios.reduce((a, b) => a + b, 0) / speedRatios.length
  );

  // Weighted Overall Score out of 100 using configurable KPI Weights
  const combinedSpeedAndQuality = Math.round(
    quality_score * 0.6 + speed_efficiency_score * 0.4
  );
  const overall_score = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        on_time_delivery_rate * wOnTime +
          first_time_approval_rate * wFirstTime +
          combinedSpeedAndQuality * wSpeedQuality
      )
    )
  );

  const tasks_completed = completedOrReviewed.filter((t) =>
    ["approved", "published"].includes(t.status)
  ).length;

  // Dynamic AI Strengths & Improvements derived from live numbers
  const ai_strengths: string[] = [];
  const ai_improvements: string[] = [];

  if (first_time_approval_rate >= 90) {
    ai_strengths.push(
      `معدل قبول من المرة الأولى ممتاز (${first_time_approval_rate}%) يعكس التزاماً عالياً بـ Brand Kit العميل.`
    );
  } else {
    ai_improvements.push(
      `رفع نسبة القبول من أول مرة (حالياً ${first_time_approval_rate}%) عبر فحص المخرج بالـ Role Copilot قبل الإرسال للمراجعة.`
    );
  }

  if (on_time_delivery_rate >= 90) {
    ai_strengths.push(
      `انضباط زمني قوي بتسليم ${on_time_delivery_rate}% من المهام في الموعد المحدد أو قبله.`
    );
  } else {
    ai_improvements.push(
      `تحسين الالتزام بمواعيد التسليم النهائية (حالياً ${on_time_delivery_rate}%) لتفادي تأخير المهام المعتمدة عليها.`
    );
  }

  if (quality_score >= 90) {
    ai_strengths.push(
      `جودة مخرجات عالية (${quality_score}%) بتقييم مباشر من مدير الحسابات والمدير العام.`
    );
  } else {
    ai_improvements.push(
      `مراجعة ملاحظات التعديلات السابقة لرفع تقييم الجودة الفنية من ${quality_score}% إلى فوق 90%.`
    );
  }

  if (ai_improvements.length === 0) {
    ai_improvements.push(
      "الاستمرار على نفس المستوى القياسي ومشاركة أفضل البرومبتات مع الفريق لتسريع الإنجاز."
    );
  }

  const memberName = member?.full_name || "عضو الفريق";
  const ai_weekly_summary = `يسجل ${memberName} درجة أداء موضوعية (${overall_score}/100) بناءً على إنجاز ${tasks_completed} مهام معتمدة، بمعدل قبول من أول مرة ${first_time_approval_rate}% ومتوسط تعديلات ${avg_revisions_per_task} لكل مهمة.`;

  return {
    overall_score,
    on_time_delivery_rate,
    first_time_approval_rate,
    quality_score,
    speed_efficiency_score,
    tasks_completed,
    avg_revisions_per_task,
    ai_strengths,
    ai_improvements,
    ai_weekly_summary,
  };
}
