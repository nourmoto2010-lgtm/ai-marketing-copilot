"use client";

// ============================================================================
// AI Marketing Team Copilot & Client Hub - Global Reactive State & RBAC Store
// ============================================================================
// يربط هذا المزود جميع أحداث تغيير حالة التاسك:
// 1. التسليم في الموعد أو متأخراً (in_review / submitTaskForReview)
// 2. طلب تعديل (revision_requested)
// 3. الاعتماد النهائي أو النشر (approved / published)
// بدالة حساب النقاط الموضوعية (calculateMemberKpiScore) لكل موظف فوراً،
// ويسجل سجل أحداث التقييم الحية (kpiEventsLog) لعرضها في لوحة التقييم والـ Workspace.
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  BrandColor,
  BrandKit,
  Campaign,
  Client,
  ClientSector,
  KpiWeightsConfig,
  PerformanceScore,
  ReviewDecision,
  Role,
  RoleSlug,
  SystemSettings,
  Task,
  TaskDeliverable,
  TaskReview,
  TaskStatus,
  User,
} from "@/types/database";
import {
  SEED_BRAND_KITS,
  SEED_CAMPAIGNS,
  SEED_CLIENTS,
  SEED_PERFORMANCE_SCORES,
  SEED_REVIEWS,
  SEED_ROLES,
  SEED_TASKS,
  SEED_USERS,
} from "@/lib/seed-data";
import {
  calculateMemberKpiScore,
  DEFAULT_KPI_WEIGHTS,
  KpiScoreEventNotification,
} from "@/lib/kpi-calculator";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

interface AppContextType {
  roles: Role[];
  users: User[];
  currentUser: User;
  currentRole: Role;
  setCurrentUserById: (userId: string) => void;
  clients: Client[];
  brandKits: BrandKit[];
  campaigns: Campaign[];
  tasks: Task[];
  reviews: TaskReview[];
  performanceScores: PerformanceScore[];
  kpiEventsLog: KpiScoreEventNotification[];
  latestKpiToast: KpiScoreEventNotification | null;
  dismissKpiToast: () => void;
  selectedClientFilter: string;
  setSelectedClientFilter: (clientId: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  kpiWeights: KpiWeightsConfig;
  systemSettings: SystemSettings;
  saveSystemSettings: (params: {
    apiKey?: string;
    model?: string;
    kpiWeights?: KpiWeightsConfig;
  }) => Promise<void>;
  upsertTeamMember: (params: {
    id?: string;
    full_name: string;
    email: string;
    role_slug: RoleSlug;
    specialty_tags: string[];
    assigned_client_ids: string[];
    is_active: boolean;
  }) => Promise<void>;
  toggleTeamMemberStatus: (userId: string) => Promise<void>;
  addNewClientWithBrandKit: (params: {
    name: string;
    name_en: string;
    sector: ClientSector;
    sector_label_ar: string;
    logo_url: string;
    cover_color: string;
    package_name: string;
    monthly_retainer_usd: number;
    posts_target: number;
    reels_target: number;
    designs_target: number;
    ad_budget_usd: number;
    colors: BrandColor[];
    tone_of_voice: string;
    target_audience: string;
    usp_and_key_messages: string;
    dos: string[];
    donts: string[];
  }) => Promise<Client>;
  updateTaskStatus: (
    taskId: string,
    newStatus: TaskStatus,
    options?: { simulateLateDelivery?: boolean }
  ) => void;
  reassignTask: (taskId: string, newUserId: string) => void;
  updateTaskDeliverable: (
    taskId: string,
    deliverable: Partial<TaskDeliverable>
  ) => void;
  submitTaskForReview: (
    taskId: string,
    options?: { simulateLateDelivery?: boolean }
  ) => void;
  reviewTask: (params: {
    taskId: string;
    decision: ReviewDecision;
    qualityRating: number;
    feedbackNotes: string;
  }) => void;
  addSplitCampaignTasks: (params: {
    clientId: string;
    campaignTitle: string;
    campaignObjective: string;
    campaignBrief: string;
    generatedTasks: Array<{
      title: string;
      role_slug: any;
      assigned_to: string;
      content_type: any;
      platform: string;
      priority: any;
      brief: string;
      estimated_hours: number;
      days_until_deadline: number;
    }>;
  }) => void;
  updateBrandKit: (clientId: string, updated: Partial<BrandKit>) => void;
  refreshMemberPerformance: (
    userId: string,
    aiEval?: {
      ai_strengths: string[];
      ai_improvements: string[];
      ai_weekly_summary: string;
    }
  ) => void;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "ai_marketing_copilot_state_v1";
const API_KEY_STORAGE = "ai_marketing_copilot_gemini_key";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [roles] = useState<Role[]>(SEED_ROLES);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>("user-ceo");
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [brandKits, setBrandKits] = useState<BrandKit[]>(SEED_BRAND_KITS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [reviews, setReviews] = useState<TaskReview[]>(SEED_REVIEWS);
  const [performanceScores, setPerformanceScores] = useState<PerformanceScore[]>(
    SEED_PERFORMANCE_SCORES
  );
  const [kpiEventsLog, setKpiEventsLog] = useState<KpiScoreEventNotification[]>(
    []
  );
  const [latestKpiToast, setLatestKpiToast] =
    useState<KpiScoreEventNotification | null>(null);
  const [selectedClientFilter, setSelectedClientFilter] =
    useState<string>("all");
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>("");
  const [kpiWeights, setKpiWeights] =
    useState<KpiWeightsConfig>(DEFAULT_KPI_WEIGHTS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    id: "global_config",
    gemini_api_key_encrypted: "",
    gemini_model: "gemini-2.0-flash",
    kpi_weights: DEFAULT_KPI_WEIGHTS,
    updated_at: new Date().toISOString(),
  });

  // Load persisted state from Supabase (when configured) or localStorage fallback
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(API_KEY_STORAGE);
      if (savedKey) setGeminiApiKeyState(savedKey);

      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.users?.length) setUsers(parsed.users);
        if (parsed.clients?.length) setClients(parsed.clients);
        if (parsed.tasks?.length) setTasks(parsed.tasks);
        if (parsed.reviews?.length) setReviews(parsed.reviews);
        if (parsed.campaigns?.length) setCampaigns(parsed.campaigns);
        if (parsed.brandKits?.length) setBrandKits(parsed.brandKits);
        if (parsed.performanceScores?.length)
          setPerformanceScores(parsed.performanceScores);
        if (parsed.kpiEventsLog?.length) setKpiEventsLog(parsed.kpiEventsLog);
        if (parsed.kpiWeights) setKpiWeights(parsed.kpiWeights);
        if (parsed.systemSettings) setSystemSettings(parsed.systemSettings);
        if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
      }
    } catch (e) {
      console.warn("Failed to load local state:", e);
    }

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const [
            usersRes,
            clientsRes,
            brandKitsRes,
            campaignsRes,
            tasksRes,
            reviewsRes,
            scoresRes,
            settingsRes,
          ] = await Promise.all([
            supabase.from("users").select("*"),
            supabase.from("clients").select("*"),
            supabase.from("brand_kits").select("*"),
            supabase.from("campaigns").select("*"),
            supabase.from("tasks").select("*"),
            supabase.from("task_reviews").select("*"),
            supabase.from("performance_scores").select("*"),
            supabase
              .from("system_settings")
              .select("*")
              .eq("id", "global_config")
              .single(),
          ]);

          if (usersRes.data?.length) setUsers(usersRes.data as User[]);
          if (clientsRes.data?.length) setClients(clientsRes.data as Client[]);
          if (brandKitsRes.data?.length)
            setBrandKits(brandKitsRes.data as BrandKit[]);
          if (campaignsRes.data?.length)
            setCampaigns(campaignsRes.data as Campaign[]);
          if (tasksRes.data?.length) setTasks(tasksRes.data as Task[]);
          if (reviewsRes.data?.length)
            setReviews(reviewsRes.data as TaskReview[]);
          if (scoresRes.data?.length)
            setPerformanceScores(scoresRes.data as PerformanceScore[]);

          if (settingsRes.data) {
            const st = settingsRes.data as SystemSettings;
            setSystemSettings(st);
            if (st.kpi_weights) setKpiWeights(st.kpi_weights);
            if (st.gemini_api_key_encrypted?.startsWith("enc_v1_")) {
              try {
                const decoded = window.atob(
                  st.gemini_api_key_encrypted.replace("enc_v1_", "")
                );
                if (decoded) setGeminiApiKeyState(decoded);
              } catch {
                // ignore decode error
              }
            }
          }
        } catch (err) {
          console.warn("Supabase initial fetch fallback:", err);
        }
      })();
    }
  }, []);

  // Save state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          clients,
          tasks,
          reviews,
          campaigns,
          brandKits,
          performanceScores,
          kpiEventsLog,
          kpiWeights,
          systemSettings,
          currentUserId,
        })
      );
    } catch (e) {
      // ignore storage quota errors
    }
  }, [
    users,
    clients,
    tasks,
    reviews,
    campaigns,
    brandKits,
    performanceScores,
    kpiEventsLog,
    kpiWeights,
    systemSettings,
    currentUserId,
  ]);

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
    } catch (e) {
      // ignore
    }
  };

  const dismissKpiToast = () => setLatestKpiToast(null);

  const currentUser =
    users.find((u) => u.id === currentUserId) || SEED_USERS[0];
  const currentRole =
    roles.find((r) => r.slug === currentUser.role_slug) || SEED_ROLES[0];

  const setCurrentUserById = (userId: string) => {
    setCurrentUserId(userId);
  };

  /**
   * دالة مركزية لإعادة حساب نقاط الأداء لأي موظف فور تغير حالة أي تاسك مسند إليه
   * وإصدار إشعار حي يوضح أثر الحدث (التسليم في الموعد، طلب التعديل، أو الاعتماد النهائي) على نقاطه.
   */
  const syncMemberScoreOnTaskEvent = (params: {
    userId: string;
    nextTasks: Task[];
    nextReviews: TaskReview[];
    taskTitle: string;
    eventType: KpiScoreEventNotification["eventType"];
    customNoteAr?: string;
  }) => {
    const {
      userId,
      nextTasks,
      nextReviews,
      taskTitle,
      eventType,
      customNoteAr,
    } = params;
    const member = users.find((u) => u.id === userId);
    if (!member) return;

    const currentScoreObj = performanceScores.find((p) => p.user_id === userId);
    const previousScore = currentScoreObj?.overall_score ?? 90;

    const memberTasks = nextTasks.filter((t) => t.assigned_to === userId);
    const memberTaskIds = new Set(memberTasks.map((t) => t.id));
    const memberReviews = nextReviews.filter((r) =>
      memberTaskIds.has(r.task_id)
    );

    const newStats = calculateMemberKpiScore(
      memberTasks,
      memberReviews,
      member,
      kpiWeights
    );
    const delta = newStats.overall_score - previousScore;

    setPerformanceScores((prev) =>
      prev.map((p) => {
        if (p.user_id !== userId) return p;
        const updatedScore = {
          ...p,
          ...newStats,
          evaluated_at: new Date().toISOString(),
        };
        if (isSupabaseConfigured && supabase) {
          supabase
            .from("performance_scores")
            .upsert(updatedScore)
            .then(() => {});
        }
        return updatedScore;
      })
    );

    const eventNotification: KpiScoreEventNotification = {
      id: `kpi-evt-${Date.now()}`,
      userId,
      userName: member.full_name,
      taskTitle,
      eventType,
      previousScore,
      newScore: newStats.overall_score,
      delta,
      summaryAr:
        customNoteAr ||
        `تم تحديث نقاط ${member.full_name} تلقائياً إلى ${newStats.overall_score}/100 (الالتزام بالموعد: ${newStats.on_time_delivery_rate}% • القبول من أول مرة: ${newStats.first_time_approval_rate}%).`,
      timestamp: new Date().toISOString(),
    };

    setKpiEventsLog((prev) => [eventNotification, ...prev.slice(0, 19)]);
    setLatestKpiToast(eventNotification);
  };

  /**
   * 1. تغيير حالة التاسك عبر السحب والإفلات (Kanban) أو الأزرار المباشرة
   * يربط تلقائياً حالات:
   * - in_review (تسليم في الموعد أو متأخر)
   * - revision_requested (طلب تعديل + زيادة عداد التعديلات)
   * - approved / published (الاعتماد النهائي + تحديث الباقة الشهرية)
   */
  const updateTaskStatus = (
    taskId: string,
    newStatus: TaskStatus,
    options?: { simulateLateDelivery?: boolean }
  ) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.status === newStatus) return;

    const deadlineTime = new Date(targetTask.deadline).getTime();
    // If simulateLateDelivery is true, set delivered_at to 12 hours after deadline; otherwise on-time
    const computedDeliveredAt = options?.simulateLateDelivery
      ? new Date(deadlineTime + 12 * 3600 * 1000).toISOString()
      : new Date(Math.min(Date.now(), deadlineTime - 1800 * 1000)).toISOString();

    const isRevisionMove = newStatus === "revision_requested";
    const isApprovalMove =
      newStatus === "approved" || newStatus === "published";
    const isReviewSubmission = newStatus === "in_review";

    const nextRevisionCount = isRevisionMove
      ? targetTask.revision_count + 1
      : targetTask.revision_count;

    const nextTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        status: newStatus,
        revision_count: nextRevisionCount,
        delivered_at:
          isReviewSubmission || isApprovalMove || options?.simulateLateDelivery
            ? computedDeliveredAt
            : t.delivered_at,
        actual_hours: options?.simulateLateDelivery
          ? Number((t.estimated_hours * 1.35).toFixed(1))
          : t.actual_hours || t.estimated_hours,
      };
    });

    let nextReviews = [...reviews];

    if (isRevisionMove || isApprovalMove) {
      const autoReview: TaskReview = {
        id: `rev-${Date.now()}`,
        task_id: taskId,
        reviewer_id: currentUser.id,
        decision: isRevisionMove ? "revision_requested" : "approved",
        quality_rating: isRevisionMove ? 7.6 : nextRevisionCount === 0 ? 9.6 : 8.8,
        feedback_notes: isRevisionMove
          ? "تم نقل المهمة إلى (مطلوب تعديل) وإعادة حساب مؤشر القبول من أول مرة."
          : "تم اعتماد المهمة نهائياً وتحديث نقاط الأداء للموظف.",
        is_first_time_approval: isApprovalMove && nextRevisionCount === 0,
        created_at: new Date().toISOString(),
      };
      nextReviews = [autoReview, ...reviews];
      setReviews(nextReviews);
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("task_reviews")
          .upsert(autoReview)
          .then(() => {});
      }
    }

    setTasks(nextTasks);
    if (isSupabaseConfigured && supabase) {
      const updatedTask = nextTasks.find((t) => t.id === taskId);
      if (updatedTask) {
        supabase
          .from("tasks")
          .upsert(updatedTask)
          .then(() => {});
      }
    }

    // Recalculate KPI Score when status impacts delivery, revisions, or final approval
    if (isReviewSubmission || isRevisionMove || isApprovalMove) {
      const eventType: KpiScoreEventNotification["eventType"] = isRevisionMove
        ? "revision_requested"
        : isApprovalMove
        ? "final_approval"
        : options?.simulateLateDelivery
        ? "late_submission"
        : "on_time_submission";

      const eventMessage = isRevisionMove
        ? `تم تسجيل طلب تعديل (Revision #${nextRevisionCount}) على "${targetTask.title}" وتحديث نسبة القبول من أول مرة للموظف.`
        : isApprovalMove
        ? `تم الاعتماد النهائي لمهمة "${targetTask.title}" (${
            nextRevisionCount === 0 ? "قبول من أول مرة ✓" : `بعد ${nextRevisionCount} تعديل`
          }) وتحديث بطاقة تقييم الموظف.`
        : options?.simulateLateDelivery
        ? `تم تسليم المهمة "${targetTask.title}" بعد الموعد النهائي وتحديث مؤشر الالتزام بالمواعيد (On-Time Delivery %).`
        : `تم تسليم المهمة "${targetTask.title}" في الموعد المحدد وتحديث مؤشر الالتزام بالمواعيد والسرعة.`;

      syncMemberScoreOnTaskEvent({
        userId: targetTask.assigned_to,
        nextTasks,
        nextReviews,
        taskTitle: targetTask.title,
        eventType,
        customNoteAr: eventMessage,
      });
    }
  };

  const reassignTask = (taskId: string, newUserId: string) => {
    const newAssignee = users.find((u) => u.id === newUserId);
    if (!newAssignee) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigned_to: newAssignee.id,
              role_slug: newAssignee.role_slug,
            }
          : t
      )
    );
  };

  const updateTaskDeliverable = (
    taskId: string,
    deliverable: Partial<TaskDeliverable>
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              deliverable_content: {
                ...t.deliverable_content,
                ...deliverable,
              },
            }
          : t
      )
    );
  };

  /**
   * 2. تسليم المهمة للمراجعة (التسليم في الموعد أو التسليم المتأخر)
   */
  const submitTaskForReview = (
    taskId: string,
    options?: { simulateLateDelivery?: boolean }
  ) => {
    updateTaskStatus(taskId, "in_review", options);
  };

  /**
   * 3. قرار المراجع (اعتماد نهائي Final Approval أو طلب تعديل Revision Requested)
   */
  const reviewTask = ({
    taskId,
    decision,
    qualityRating,
    feedbackNotes,
  }: {
    taskId: string;
    decision: ReviewDecision;
    qualityRating: number;
    feedbackNotes: string;
  }) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const isFirstTime =
      decision === "approved" && targetTask.revision_count === 0;
    const newRevisionCount =
      decision === "revision_requested"
        ? targetTask.revision_count + 1
        : targetTask.revision_count;

    const newReview: TaskReview = {
      id: `rev-${Date.now()}`,
      task_id: taskId,
      reviewer_id: currentUser.id,
      decision,
      quality_rating: qualityRating,
      feedback_notes: feedbackNotes,
      is_first_time_approval: isFirstTime,
      created_at: new Date().toISOString(),
    };

    const nextReviews = [newReview, ...reviews];
    const nextTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: (decision === "approved"
              ? "approved"
              : "revision_requested") as TaskStatus,
            revision_count: newRevisionCount,
            delivered_at: t.delivered_at || new Date().toISOString(),
            deliverable_content: {
              ...t.deliverable_content,
              notes: feedbackNotes,
            },
          }
        : t
    );

    setReviews(nextReviews);
    setTasks(nextTasks);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("task_reviews")
        .upsert(newReview)
        .then(() => {});
      const updatedTask = nextTasks.find((t) => t.id === taskId);
      if (updatedTask) {
        supabase
          .from("tasks")
          .upsert(updatedTask)
          .then(() => {});
      }
    }

    // Recalculate assignee's KPI score immediately and broadcast event
    syncMemberScoreOnTaskEvent({
      userId: targetTask.assigned_to,
      nextTasks,
      nextReviews,
      taskTitle: targetTask.title,
      eventType:
        decision === "approved" ? "final_approval" : "revision_requested",
      customNoteAr:
        decision === "approved"
          ? `اعتماد نهائي لمهمة "${targetTask.title}" بتقييم جودة ${qualityRating}/10 (${
              isFirstTime
                ? "قبول من أول مرة بدون تعديلات ✓"
                : `بعد ${newRevisionCount} تعديل`
            }).`
          : `طلب تعديل (Revision #${newRevisionCount}) على مهمة "${targetTask.title}" — تم تحديث مؤشر القبول من أول مرة ومتوسط التعديلات للموظف.`,
    });

    // If approved, increment client monthly package counter
    if (decision === "approved") {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== targetTask.client_id) return c;
          const pkg = { ...c.monthly_package };
          if (
            targetTask.content_type === "reel" ||
            targetTask.content_type === "motion_video"
          ) {
            pkg.reels_done = Math.min(pkg.reels_target, pkg.reels_done + 1);
          } else if (
            targetTask.content_type === "static_post" ||
            targetTask.content_type === "carousel"
          ) {
            pkg.posts_done = Math.min(pkg.posts_target, pkg.posts_done + 1);
            pkg.designs_done = Math.min(
              pkg.designs_target,
              pkg.designs_done + 1
            );
          }
          return { ...c, monthly_package: pkg };
        })
      );
    }
  };

  const addSplitCampaignTasks: AppContextType["addSplitCampaignTasks"] = ({
    clientId,
    campaignTitle,
    campaignObjective,
    campaignBrief,
    generatedTasks,
  }) => {
    const newCampaignId = `camp-${Date.now()}`;
    const today = new Date();
    const endDate = new Date(today.getTime() + 14 * 86400000);

    const newCampaign: Campaign = {
      id: newCampaignId,
      client_id: clientId,
      title: campaignTitle,
      objective: campaignObjective,
      brief: campaignBrief,
      start_date: today.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      status: "active",
      ad_metrics: {
        budget_usd: 3000,
        spend_usd: 0,
        roas: 0,
        ctr: 0,
        cpl_usd: 0,
        conversions: 0,
        impressions: 0,
      },
    };

    const createdIds = generatedTasks.map(
      (_, idx) => `task-${Date.now()}-${idx}`
    );

    const newTasks: Task[] = generatedTasks.map((gt, idx) => {
      const deadlineDate = new Date(
        today.getTime() + (gt.days_until_deadline || idx + 1) * 86400000
      );
      const publishDate = new Date(deadlineDate.getTime() + 86400000);

      return {
        id: createdIds[idx],
        campaign_id: newCampaignId,
        client_id: clientId,
        assigned_to: gt.assigned_to || "user-content",
        role_slug: gt.role_slug || "content_creator",
        title: gt.title,
        brief: gt.brief,
        content_type: gt.content_type || "reel",
        platform: gt.platform || "Instagram & TikTok",
        status: idx === 0 ? "in_progress" : "backlog",
        priority: gt.priority || "high",
        dependencies: idx > 0 ? [createdIds[0]] : [],
        scheduled_publish_date: publishDate.toISOString().slice(0, 10),
        deadline: deadlineDate.toISOString(),
        estimated_hours: gt.estimated_hours || 3,
        revision_count: 0,
        deliverable_content: {},
      };
    });

    setCampaigns((prev) => [newCampaign, ...prev]);
    setTasks((prev) => [...newTasks, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("campaigns")
        .upsert(newCampaign)
        .then(() => {});
      supabase
        .from("tasks")
        .upsert(newTasks)
        .then(() => {});
    }
  };

  const updateBrandKit = (clientId: string, updated: Partial<BrandKit>) => {
    setBrandKits((prev) =>
      prev.map((bk) => {
        if (bk.client_id !== clientId) return bk;
        const nextBk = { ...bk, ...updated };
        if (isSupabaseConfigured && supabase) {
          supabase
            .from("brand_kits")
            .upsert(nextBk)
            .then(() => {});
        }
        return nextBk;
      })
    );
  };

  const refreshMemberPerformance: AppContextType["refreshMemberPerformance"] = (
    userId,
    aiEval
  ) => {
    const member = users.find((u) => u.id === userId);
    const memberTasks = tasks.filter((t) => t.assigned_to === userId);
    const memberTaskIds = new Set(memberTasks.map((t) => t.id));
    const memberReviews = reviews.filter((r) => memberTaskIds.has(r.task_id));
    const stats = calculateMemberKpiScore(
      memberTasks,
      memberReviews,
      member,
      kpiWeights
    );

    setPerformanceScores((prev) =>
      prev.map((p) =>
        p.user_id === userId
          ? {
              ...p,
              ...stats,
              ...(aiEval || {}),
              evaluated_at: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const saveSystemSettings: AppContextType["saveSystemSettings"] = async ({
    apiKey,
    model,
    kpiWeights: nextWeights,
  }) => {
    const cleanKey = apiKey !== undefined ? apiKey.trim() : geminiApiKey;
    if (apiKey !== undefined) {
      setGeminiApiKey(cleanKey);
    }

    const activeWeights = nextWeights || kpiWeights;
    if (nextWeights) {
      setKpiWeights(nextWeights);
      // Immediately recalculate all team member scores using the new KPI weights
      setPerformanceScores((prev) =>
        prev.map((ps) => {
          const member = users.find((u) => u.id === ps.user_id);
          const mTasks = tasks.filter((t) => t.assigned_to === ps.user_id);
          const mTaskIds = new Set(mTasks.map((t) => t.id));
          const mReviews = reviews.filter((r) => mTaskIds.has(r.task_id));
          const stats = calculateMemberKpiScore(
            mTasks,
            mReviews,
            member,
            nextWeights
          );
          return {
            ...ps,
            ...stats,
            evaluated_at: new Date().toISOString(),
          };
        })
      );
    }

    const encryptedKey = cleanKey
      ? `enc_v1_${
          typeof window !== "undefined" ? window.btoa(cleanKey) : cleanKey
        }`
      : "";

    const updatedSettings: SystemSettings = {
      id: "global_config",
      gemini_api_key_encrypted: encryptedKey,
      gemini_model: model || systemSettings.gemini_model || "gemini-2.0-flash",
      kpi_weights: activeWeights,
      updated_at: new Date().toISOString(),
    };

    setSystemSettings(updatedSettings);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("system_settings").upsert({
          id: "global_config",
          gemini_api_key_encrypted: encryptedKey,
          gemini_model: updatedSettings.gemini_model,
          kpi_weights: activeWeights,
          updated_at: updatedSettings.updated_at,
        });
      } catch (e) {
        console.warn("Supabase system_settings sync warning:", e);
      }
    }
  };

  const upsertTeamMember: AppContextType["upsertTeamMember"] = async (
    params
  ) => {
    const roleObj =
      roles.find((r) => r.slug === params.role_slug) || roles[2];
    const accessLevel =
      params.role_slug === "ceo"
        ? "director"
        : params.role_slug === "account_manager"
        ? "team_lead"
        : "member";

    if (params.id) {
      // Edit existing member
      setUsers((prev) =>
        prev.map((u) =>
          u.id === params.id
            ? {
                ...u,
                full_name: params.full_name,
                email: params.email,
                role_id: roleObj.id,
                role_slug: params.role_slug,
                access_level: accessLevel,
                job_title_ar: roleObj.name_ar,
                specialty_tags: params.specialty_tags,
                assigned_client_ids: params.assigned_client_ids,
                is_active: params.is_active,
              }
            : u
        )
      );
    } else {
      // Create new member + initial performance scorecard
      const newUserId = `user-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        full_name: params.full_name,
        email: params.email,
        avatar_url: `https://api.dicebear.com/9.x/Notionists/svg?seed=${encodeURIComponent(
          params.email || params.full_name
        )}`,
        role_id: roleObj.id,
        role_slug: params.role_slug,
        access_level: accessLevel,
        job_title_ar: roleObj.name_ar,
        specialty_tags:
          params.specialty_tags.length > 0
            ? params.specialty_tags
            : [roleObj.name_en],
        assigned_client_ids: params.assigned_client_ids,
        is_active: params.is_active,
      };

      setUsers((prev) => [...prev, newUser]);

      const newScore: PerformanceScore = {
        id: `perf-${Date.now()}`,
        user_id: newUserId,
        period_label: "نوفمبر 2026 - الأسبوع 3",
        overall_score: 90,
        on_time_delivery_rate: 92,
        first_time_approval_rate: 90,
        quality_score: 90,
        speed_efficiency_score: 88,
        tasks_completed: 0,
        avg_revisions_per_task: 0,
        ai_strengths: [
          `تم تعيين ${params.full_name} في دور (${roleObj.name_ar}) وربطه بالمساعد الذكي.`,
        ],
        ai_improvements: [
          "البدء في تنفيذ المهام المسندة لتحليل مؤشرات القبول من أول مرة.",
        ],
        ai_weekly_summary: `انضم ${params.full_name} للفريق كـ ${roleObj.name_ar} وتم تفعيل بطاقة تقييم الأداء الخاصة به.`,
        evaluated_at: new Date().toISOString(),
      };
      setPerformanceScores((prev) => [newScore, ...prev]);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("users").upsert(newUser);
          await supabase.from("performance_scores").upsert(newScore);
        } catch (e) {
          console.warn("Supabase users insert warning:", e);
        }
      }
    }
  };

  const toggleTeamMemberStatus: AppContextType["toggleTeamMemberStatus"] =
    async (userId) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: !u.is_active } : u
        )
      );
    };

  const addNewClientWithBrandKit: AppContextType["addNewClientWithBrandKit"] =
    async (params) => {
      const newClientId = `client-${Date.now()}`;
      const newClient: Client = {
        id: newClientId,
        name: params.name,
        name_en: params.name_en || params.name,
        sector: params.sector,
        sector_label_ar: params.sector_label_ar,
        logo_url: params.logo_url || "🏢",
        cover_color: params.cover_color || params.colors[0]?.hex || "#2563EB",
        account_manager_id: "user-am",
        status: "active",
        monthly_package: {
          package_name: params.package_name || "باقة النمو المتكاملة",
          monthly_retainer_usd: params.monthly_retainer_usd || 3000,
          posts_target: params.posts_target || 16,
          posts_done: 0,
          reels_target: params.reels_target || 8,
          reels_done: 0,
          designs_target: params.designs_target || 20,
          designs_done: 0,
          ad_budget_usd: params.ad_budget_usd || 3500,
          ad_spend_usd: 0,
        },
      };

      const newBrandKit: BrandKit = {
        id: `bk-${Date.now()}`,
        client_id: newClientId,
        colors:
          params.colors.length > 0
            ? params.colors
            : [
                {
                  name: "اللون الأساسي",
                  hex: params.cover_color || "#2563EB",
                  usage: "العناوين والهوية",
                },
              ],
        fonts: {
          heading: "Cairo Bold",
          body: "Cairo Regular",
          english: "Inter SemiBold",
        },
        tone_of_voice: params.tone_of_voice,
        target_audience: params.target_audience,
        usp_and_key_messages: params.usp_and_key_messages,
        dos_and_donts: {
          dos:
            params.dos.length > 0
              ? params.dos
              : ["الالتزام بألوان الهوية البصرية ونبرة الصوت المعتمدة"],
          donts:
            params.donts.length > 0
              ? params.donts
              : ["تجنب المبالغات غير الواقعية أو الخروج عن نبرة العلامة"],
        },
        social_links: {},
        visual_style_prompt_prefix: `Commercial brand photography for ${params.name_en}, color palette featuring ${params.colors
          .map((c) => c.hex)
          .join(" and ")}, studio lighting, photorealistic, 8k`,
      };

      const onboardingCampaignId = `camp-${Date.now()}`;
      const newCampaign: Campaign = {
        id: onboardingCampaignId,
        client_id: newClientId,
        title: `حملة الإطلاق والنمو — ${params.name}`,
        objective: "Brand Awareness & Conversions",
        brief: params.usp_and_key_messages,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .slice(0, 10),
        status: "active",
        ad_metrics: {
          budget_usd: params.ad_budget_usd || 3500,
          spend_usd: 0,
          roas: 5.0,
          ctr: 3.1,
          cpl_usd: 2.0,
          conversions: 0,
          impressions: 0,
        },
      };

      const initialTask: Task = {
        id: `task-${Date.now()}`,
        campaign_id: onboardingCampaignId,
        client_id: newClientId,
        assigned_to: "user-content",
        role_slug: "content_creator",
        title: `كتابة سكريبت ريلز وخطة إطلاق: ${params.name}`,
        brief: `إعداد أول سكريبت Reels وكابشن ترحيبي للعميل الجديد "${params.name}" بالاعتماد على نبرة الصوت المضافة في Brand Kit.`,
        content_type: "reel",
        platform: "Instagram & TikTok",
        status: "in_progress",
        priority: "high",
        dependencies: [],
        scheduled_publish_date: new Date(Date.now() + 2 * 86400000)
          .toISOString()
          .slice(0, 10),
        deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
        estimated_hours: 3,
        revision_count: 0,
        deliverable_content: {},
      };

      setClients((prev) => [newClient, ...prev]);
      setBrandKits((prev) => [newBrandKit, ...prev]);
      setCampaigns((prev) => [newCampaign, ...prev]);
      setTasks((prev) => [initialTask, ...prev]);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("clients").upsert(newClient);
          await supabase.from("brand_kits").upsert(newBrandKit);
          await supabase.from("campaigns").upsert(newCampaign);
          await supabase.from("tasks").upsert(initialTask);
        } catch (e) {
          console.warn("Supabase client & brand_kit insert warning:", e);
        }
      }

      return newClient;
    };

  const resetToSeedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(SEED_USERS);
    setClients(SEED_CLIENTS);
    setBrandKits(SEED_BRAND_KITS);
    setCampaigns(SEED_CAMPAIGNS);
    setTasks(SEED_TASKS);
    setReviews(SEED_REVIEWS);
    setPerformanceScores(SEED_PERFORMANCE_SCORES);
    setKpiWeights(DEFAULT_KPI_WEIGHTS);
    setKpiEventsLog([]);
    setLatestKpiToast(null);
    setCurrentUserId("user-ceo");
  };

  return (
    <AppContext.Provider
      value={{
        roles,
        users,
        currentUser,
        currentRole,
        setCurrentUserById,
        clients,
        brandKits,
        campaigns,
        tasks,
        reviews,
        performanceScores,
        kpiEventsLog,
        latestKpiToast,
        dismissKpiToast,
        selectedClientFilter,
        setSelectedClientFilter,
        geminiApiKey,
        setGeminiApiKey,
        kpiWeights,
        systemSettings,
        saveSystemSettings,
        upsertTeamMember,
        toggleTeamMemberStatus,
        addNewClientWithBrandKit,
        updateTaskStatus,
        reassignTask,
        updateTaskDeliverable,
        submitTaskForReview,
        reviewTask,
        addSplitCampaignTasks,
        updateBrandKit,
        refreshMemberPerformance,
        resetToSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppProvider");
  }
  return ctx;
}
