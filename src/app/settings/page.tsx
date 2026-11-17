"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  Edit3,
  KeyRound,
  Lock,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-context";
import {
  BrandColor,
  ClientSector,
  RoleSlug,
  User,
} from "@/types/database";
import { cn, ROLE_LABELS } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const SECTOR_OPTIONS: { value: ClientSector; label_ar: string; icon: string }[] =
  [
    {
      value: "food_sweets",
      label_ar: "قطاع الأغذية والحلويات",
      icon: "🍯",
    },
    {
      value: "cafes",
      label_ar: "قطاع الكافيهات والمقاهي",
      icon: "☕",
    },
    {
      value: "pharmacies",
      label_ar: "قطاع الصيدليات والرعاية الصحية",
      icon: "⚕️",
    },
    {
      value: "industry_export",
      label_ar: "قطاع الصناعة والتصدير (B2B)",
      icon: "🚢",
    },
  ];

const ASSIGNABLE_ROLES: RoleSlug[] = [
  "content_creator",
  "graphic_designer",
  "video_editor",
  "media_buyer",
  "account_manager",
  "moderation",
];

export default function AdminSettingsPage() {
  const {
    currentUser,
    users,
    clients,
    brandKits,
    geminiApiKey,
    kpiWeights,
    systemSettings,
    saveSystemSettings,
    upsertTeamMember,
    toggleTeamMemberStatus,
    deleteTeamMember,
    addNewClientWithBrandKit,
    setCurrentUserById,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"ai_kpi" | "team" | "clients">(
    "ai_kpi"
  );

  // ---------------------------------------------------------------------------
  // Tab 1 State: AI & KPI Config
  // ---------------------------------------------------------------------------
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [selectedModel, setSelectedModel] = useState(
    systemSettings.gemini_model || "gemini-2.0-flash"
  );
  const [onTimeWeight, setOnTimeWeight] = useState<number>(
    kpiWeights.on_time_weight
  );
  const [firstTimeWeight, setFirstTimeWeight] = useState<number>(
    kpiWeights.first_time_approval_weight
  );
  const [speedQualityWeight, setSpeedQualityWeight] = useState<number>(
    kpiWeights.speed_quality_weight
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    ok: boolean;
    message: string;
    mode?: string;
  } | null>(null);
  const [savedSettingsToast, setSavedSettingsToast] = useState(false);

  const weightsSum = onTimeWeight + firstTimeWeight + speedQualityWeight;

  // Auto-balance helper
  const handleNormalizeWeights = () => {
    setOnTimeWeight(40);
    setFirstTimeWeight(35);
    setSpeedQualityWeight(25);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKeyInput,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      setConnectionResult({
        ok: Boolean(data.ok),
        message: data.message,
        mode: data.mode,
      });

      if (data.ok) {
        await saveSystemSettings({
          apiKey: apiKeyInput,
          model: selectedModel,
        });
      }
    } catch (e: any) {
      setConnectionResult({
        ok: false,
        message: "تعذر الاتصال بخادم الاختبار. يرجى التحقق من المفتاح.",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveAiAndKpiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSystemSettings({
      apiKey: apiKeyInput,
      model: selectedModel,
      kpiWeights: {
        on_time_weight: onTimeWeight,
        first_time_approval_weight: firstTimeWeight,
        speed_quality_weight: speedQualityWeight,
      },
    });
    setSavedSettingsToast(true);
    setTimeout(() => setSavedSettingsToast(false), 2500);
  };

  // ---------------------------------------------------------------------------
  // Tab 2 State: Team Management Modal
  // ---------------------------------------------------------------------------
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | undefined>(
    undefined
  );
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRoleSlug, setMemberRoleSlug] =
    useState<RoleSlug>("content_creator");
  const [memberTagsInput, setMemberTagsInput] = useState(
    "Reels Scripting, Hooks, Copywriting"
  );
  const [memberAssignedClients, setMemberAssignedClients] = useState<string[]>(
    []
  );
  const [memberIsActive, setMemberIsActive] = useState(true);

  const openAddMemberModal = () => {
    setEditingMemberId(undefined);
    setMemberName("");
    setMemberEmail("");
    setMemberRoleSlug("content_creator");
    setMemberTagsInput("Reels Scripting, Copywriting, Brand Voice");
    setMemberAssignedClients(clients.map((c) => c.id));
    setMemberIsActive(true);
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: User) => {
    setEditingMemberId(member.id);
    setMemberName(member.full_name);
    setMemberEmail(member.email);
    setMemberRoleSlug(member.role_slug);
    setMemberTagsInput(member.specialty_tags.join(", "));
    setMemberAssignedClients(
      member.assigned_client_ids || clients.map((c) => c.id)
    );
    setMemberIsActive(member.is_active);
    setIsMemberModalOpen(true);
  };

  const toggleClientForMember = (clientId: string) => {
    setMemberAssignedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    await upsertTeamMember({
      id: editingMemberId,
      full_name: memberName.trim(),
      email: memberEmail.trim(),
      role_slug: memberRoleSlug,
      specialty_tags: memberTagsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      assigned_client_ids: memberAssignedClients,
      is_active: memberIsActive,
    });
    setIsMemberModalOpen(false);
  };

  // ---------------------------------------------------------------------------
  // Tab 3 State: Add New Client & Brand Vault Modal
  // ---------------------------------------------------------------------------
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientNameAr, setClientNameAr] = useState("");
  const [clientNameEn, setClientNameEn] = useState("");
  const [clientSector, setClientSector] =
    useState<ClientSector>("food_sweets");
  const [clientLogoEmoji, setClientLogoEmoji] = useState("🍯");
  const [packageName, setPackageName] = useState("باقة النمو المتكاملة Pro");
  const [monthlyRetainer, setMonthlyRetainer] = useState(3000);
  const [postsTarget, setPostsTarget] = useState(16);
  const [reelsTarget, setReelsTarget] = useState(10);
  const [designsTarget, setDesignsTarget] = useState(22);
  const [adBudgetUsd, setAdBudgetUsd] = useState(4000);
  const [brandColors, setBrandColors] = useState<BrandColor[]>([
    { name: "اللون الأساسي", hex: "#0F172A", usage: "العناوين والخلفيات" },
    { name: "اللون الثانوي", hex: "#2563EB", usage: "الأزرار والـ CTA" },
    { name: "لون التمييز", hex: "#10B981", usage: "الشارات والعروض" },
  ]);
  const [toneOfVoice, setToneOfVoice] = useState(
    "احترافية، قريبة من الجمهور، تركز على القيمة والجودة العالية."
  );
  const [targetAudience, setTargetAudience] = useState(
    "العائلات والشباب الباحثون عن جودة موثوقة وخدمة سريعة."
  );
  const [uspMessages, setUspMessages] = useState(
    "ضمان الجودة 100% مع تجربة عميل استثنائية وتوصيل سريع."
  );
  const [dosInput, setDosInput] = useState(
    "إبراز الهوية البصرية بوضوح\nاستخدام هوكات خاطفة في أول 3 ثوانٍ"
  );
  const [dontsInput, setDontsInput] = useState(
    "ممنوع استخدام وعود مبالغ فيها\nممنوع استخدام ألوان خارج باليت الهوية"
  );
  const [clientCreatedNotice, setClientCreatedNotice] = useState<string | null>(
    null
  );

  const handleUpdateColor = (
    idx: number,
    field: keyof BrandColor,
    val: string
  ) => {
    setBrandColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNameAr.trim()) return;

    const sectorMeta =
      SECTOR_OPTIONS.find((s) => s.value === clientSector) ||
      SECTOR_OPTIONS[0];

    const created = await addNewClientWithBrandKit({
      name: clientNameAr.trim(),
      name_en: clientNameEn.trim() || clientNameAr.trim(),
      sector: clientSector,
      sector_label_ar: sectorMeta.label_ar,
      logo_url: clientLogoEmoji || sectorMeta.icon,
      cover_color: brandColors[0]?.hex || "#2563EB",
      package_name: packageName,
      monthly_retainer_usd: monthlyRetainer,
      posts_target: postsTarget,
      reels_target: reelsTarget,
      designs_target: designsTarget,
      ad_budget_usd: adBudgetUsd,
      colors: brandColors,
      tone_of_voice: toneOfVoice,
      target_audience: targetAudience,
      usp_and_key_messages: uspMessages,
      dos: dosInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      donts: dontsInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setIsClientModalOpen(false);
    setClientNameAr("");
    setClientNameEn("");
    setClientCreatedNotice(
      `تمت إضافة العميل "${created.name}" وخزنة هويته البصرية وأول مهمة إطلاق في الـ Kanban بنجاح!`
    );
    setTimeout(() => setClientCreatedNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
            <Settings className="w-3.5 h-3.5 text-indigo-400" />
            <span>لوحة التحكم والإعدادات الإدارية (CEO / Admin Control Center)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            إدارة النظام، مفاتيح الذكاء الاصطناعي، أوزان التقييم، الفريق، والعملاء
          </h1>
          <p className="text-xs text-slate-500">
            أي تعديل تجريه هنا يُحفظ في قاعدة البيانات (<code className="font-en">system_settings</code>, <code className="font-en">users</code>, <code className="font-en">clients</code>, <code className="font-en">brand_kits</code>) وينعكس فوراً في لوحة الـ Kanban، بطاقات التقييم، والـ AI Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold flex items-center gap-2">
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                isSupabaseConfigured ? "bg-emerald-500" : "bg-indigo-500"
              )}
            />
            <span className="font-en">
              {isSupabaseConfigured
                ? "Supabase Cloud + Local Sync"
                : "Hybrid Store Active (Supabase Ready)"}
            </span>
          </div>
        </div>
      </div>

      {/* Role Access Notice if user switched to non-CEO in RBAC simulator */}
      {currentUser.role_slug !== "ceo" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              أنت تتصفح النظام حالياً بدور (<strong>{currentUser.full_name} — {ROLE_LABELS[currentUser.role_slug]?.ar}</strong>). صفحة الإعدادات مخصصة للمدير العام (CEO / Admin).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentUserById("user-ceo")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            التبديل الفوري لحساب المدير العام (CEO) ←
          </button>
        </div>
      )}

      {/* 3 Main Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-card-soft flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("ai_kpi")}
          className={cn(
            "flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2",
            activeTab === "ai_kpi"
              ? "bg-ai-gradient text-white shadow-ai-glow"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>1. إعدادات الذكاء الاصطناعي والتقييم (AI & KPI Config)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={cn(
            "flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2",
            activeTab === "team"
              ? "bg-ai-gradient text-white shadow-ai-glow"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Users className="w-4 h-4" />
          <span>2. إدارة فريق العمل ({users.length} أعضاء)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={cn(
            "flex-1 min-w-[220px] py-3 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2",
            activeTab === "clients"
              ? "bg-ai-gradient text-white shadow-ai-glow"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Briefcase className="w-4 h-4" />
          <span>3. إدارة العملاء وخزنة الهوية ({clients.length} عملاء)</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: AI & KPI Config
      ===================================================================== */}
      {activeTab === "ai_kpi" && (
        <form
          onSubmit={handleSaveAiAndKpiSettings}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Card 1: Gemini API Key & Connection Tester */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card-soft p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    إعداد مفتاح Google Gemini API وتشفيره
                  </h2>
                  <p className="text-xs text-slate-500 font-en">
                    Stored in public.system_settings (gemini_api_key_encrypted)
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-en font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> AES/Base64 Encrypted
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مفتاح Gemini API Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    dir="ltr"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSyYourGoogleGeminiApiKey..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-en focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Wifi className="w-3.5 h-3.5" />
                    <span>
                      {isTestingConnection
                        ? "جاري الفحص..."
                        : "اختبار الاتصال (Test Connection)"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نموذج الذكاء الاصطناعي المعتمد (Gemini Model):
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-en font-bold bg-slate-50"
                >
                  <option value="gemini-2.0-flash">
                    gemini-2.0-flash (Recommended - Fast & Multimodal)
                  </option>
                  <option value="gemini-1.5-pro">
                    gemini-1.5-pro (Deep Reasoning & Strategy)
                  </option>
                  <option value="gemini-1.5-flash">
                    gemini-1.5-flash (High Throughput)
                  </option>
                </select>
              </div>

              {/* Encrypted DB Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    القيمة المشفرة في جدول <code className="font-en">system_settings</code>:
                  </span>
                  <span className="text-[10px] font-en text-slate-400">
                    Updated: {systemSettings.updated_at.slice(0, 16).replace("T", " ")}
                  </span>
                </div>
                <p className="font-en text-[11px] text-slate-500 truncate" dir="ltr">
                  {systemSettings.gemini_api_key_encrypted ||
                    "enc_v1_NoKeyStoredYet (Using Smart Brand Engine Fallback)"}
                </p>
              </div>

              {/* Connection Test Result Banner */}
              {connectionResult && (
                <div
                  className={cn(
                    "p-4 rounded-xl border text-xs flex items-start gap-2.5",
                    connectionResult.ok
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  )}
                >
                  {connectionResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-extrabold">
                      {connectionResult.ok
                        ? "نجح اختبار الاتصال!"
                        : "تنبيه فحص الاتصال"}
                    </p>
                    <p>{connectionResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: KPI Weights Sliders (Out of 100%) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card-soft p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      أوزان معادلة تقييم الأداء الذكي (KPI Weights Config)
                    </h2>
                    <p className="text-xs text-slate-500">
                      حدد الأوزان النسبية من 100% ليقوم النظام بإعادة حساب درجات جميع الموظفين فوراً.
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-en font-extrabold border",
                    weightsSum === 100
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  )}
                >
                  Total: {weightsSum}%
                </span>
              </div>

              {/* Slider 1: On-Time Delivery Weight */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    1. وزن الالتزام بالمواعيد (On-Time Delivery Rate):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={onTimeWeight}
                      onChange={(e) => setOnTimeWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-en font-extrabold text-xs bg-white"
                    />
                    <span className="text-xs font-en font-bold text-slate-600">
                      %
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={onTimeWeight}
                  onChange={(e) => setOnTimeWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: First-Time Approval Weight */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    2. وزن القبول من أول مرة بدون تعديلات (First-Time Approval):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={firstTimeWeight}
                      onChange={(e) =>
                        setFirstTimeWeight(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-en font-extrabold text-xs bg-white"
                    />
                    <span className="text-xs font-en font-bold text-slate-600">
                      %
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={firstTimeWeight}
                  onChange={(e) => setFirstTimeWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Speed & Quality Weight */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">
                    3. وزن سرعة الإنجاز وجودة المخرجات (Speed & Quality):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={speedQualityWeight}
                      onChange={(e) =>
                        setSpeedQualityWeight(Number(e.target.value))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-en font-extrabold text-xs bg-white"
                    />
                    <span className="text-xs font-en font-bold text-slate-600">
                      %
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={speedQualityWeight}
                  onChange={(e) =>
                    setSpeedQualityWeight(Number(e.target.value))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Save Config Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleNormalizeWeights}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600"
              >
                إعادة للأوزان القياسية (40% / 35% / 25%)
              </button>

              <div className="flex items-center gap-3">
                {savedSettingsToast && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    تم حفظ الإعدادات وتحديث تقييمات الفريق!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow hover:opacity-95 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الإعدادات وتحديث معادلة التقييم</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* =====================================================================
          TAB 2: Team Management
      ===================================================================== */}
      {activeTab === "team" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card-soft p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                سجل أعضاء فريق الوكالة وإدارة الصلاحيات ({users.length} أعضاء)
              </h2>
              <p className="text-xs text-slate-500">
                أضف موظفاً جديداً أو عدل دوره الوظيفي والعملاء المعيّنين له، وسيظهر فوراً في مبدّل الأدوار، لوحة الـ Kanban، وبطاقات التقييم.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddMemberModal}
              className="px-5 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة موظف جديد للفريق</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-600">
                  <th className="p-3.5 rounded-r-xl">العضو</th>
                  <th className="p-3.5">الدور الوظيفي (Role)</th>
                  <th className="p-3.5">المهارات والتخصص</th>
                  <th className="p-3.5">العملاء المعيّنون</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 rounded-l-xl">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((member) => {
                  const assignedIds = member.assigned_client_ids;
                  const memberClients =
                    assignedIds && assignedIds.length > 0
                      ? clients.filter((c) => assignedIds.includes(c.id))
                      : clients;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900">
                              {member.full_name}
                            </p>
                            <p className="text-[11px] font-en text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full border text-[11px] font-bold inline-block",
                            ROLE_LABELS[member.role_slug]?.badgeClass
                          )}
                        >
                          {ROLE_LABELS[member.role_slug]?.ar} •{" "}
                          <span className="font-en">
                            {ROLE_LABELS[member.role_slug]?.en}
                          </span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {member.specialty_tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-en text-[10px] font-semibold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {memberClients.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[10px] font-bold"
                            >
                              {c.logo_url} {c.name.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => toggleTeamMemberStatus(member.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold border transition",
                            member.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {member.is_active ? "● نشط" : "○ موقوف"}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditMemberModal(member)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold text-xs transition inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTeamMember(member.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-bold text-xs transition inline-flex items-center gap-1"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: Clients & Brand Vault Manager
      ===================================================================== */}
      {activeTab === "clients" && (
        <div className="space-y-5">
          {clientCreatedNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{clientCreatedNotice}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card-soft p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                إدارة العملاء وخزنة الهوية البصرية ({clients.length} عملاء)
              </h2>
              <p className="text-xs text-slate-500">
                عند إضافة عميل جديد مع ألوانه ونبرة صوته، يتعرف عليه الـ AI Copilot ومقسم الحملات فوراً في جميع صفحات النظام.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد + Brand Kit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clients.map((client) => {
              const bk = brandKits.find((b) => b.client_id === client.id);
              const pkg = client.monthly_package;
              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card-soft space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-slate-200"
                        style={{ backgroundColor: `${client.cover_color}18` }}
                      >
                        {client.logo_url}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {client.sector_label_ar}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                          {client.name}
                        </h3>
                        <p className="text-xs font-en text-slate-500">
                          {client.name_en}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-en font-extrabold text-indigo-600">
                        ${pkg.monthly_retainer_usd}/mo
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {pkg.posts_target} بوست • {pkg.reels_target} ريلز •{" "}
                        {pkg.designs_target} تصميم
                      </p>
                    </div>
                  </div>

                  {bk && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          ألوان الهوية (Hex Palette):
                        </span>
                        <div className="flex items-center gap-1.5">
                          {bk.colors.map((col, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-en font-bold"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: col.hex }}
                              />
                              {col.hex}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        <strong>نبرة الصوت:</strong> {bk.tone_of_voice}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: Add / Edit Team Member
      ===================================================================== */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingMemberId
                  ? "تعديل بيانات عضو الفريق"
                  : "إضافة موظف جديد إلى فريق الوكالة"}
              </h3>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكامل:
                  </label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="مثال: أحمد طارق"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني:
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="ahmed@launchpad-agency.ai"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-en"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدور الوظيفي (يحدد صلاحيات الـ RBAC وأدوات الـ AI Copilot):
                </label>
                <select
                  value={memberRoleSlug}
                  onChange={(e) =>
                    setMemberRoleSlug(e.target.value as RoleSlug)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                >
                  {ASSIGNABLE_ROLES.map((rSlug) => (
                    <option key={rSlug} value={rSlug}>
                      {ROLE_LABELS[rSlug]?.ar} — ({ROLE_LABELS[rSlug]?.en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المهارات الفرعية (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={memberTagsInput}
                  onChange={(e) => setMemberTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-en"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  العملاء المعيّنون لهذا الموظف:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clients.map((c) => {
                    const checked = memberAssignedClients.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleClientForMember(c.id)}
                        className={cn(
                          "p-2.5 rounded-xl border text-right text-xs font-bold flex items-center justify-between transition",
                          checked
                            ? "bg-indigo-50 border-indigo-400 text-indigo-900"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        <span>
                          {c.logo_url} {c.name}
                        </span>
                        {checked && (
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={memberIsActive}
                    onChange={(e) => setMemberIsActive(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>الحساب نشط ومتاح لاستلام المهام</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow"
                  >
                    حفظ بيانات الموظف
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: Add New Client & Brand Kit
      ===================================================================== */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ai-gradient text-white flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    إضافة عميل جديد وتجهيز خزنة هويته (Client & Brand Vault Setup)
                  </h3>
                  <p className="text-xs text-slate-500">
                    سيتم ربط ألوان العميل ونبرة صوته تلقائياً بجميع برومبتات الـ AI Copilot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم العميل (بالعربية):
                  </label>
                  <input
                    type="text"
                    required
                    value={clientNameAr}
                    onChange={(e) => setClientNameAr(e.target.value)}
                    placeholder="مثال: حلويات السلطان"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم بالإنجليزية:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={clientNameEn}
                    onChange={(e) => setClientNameEn(e.target.value)}
                    placeholder="Al-Sultan Sweets"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-en"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القطاع:
                  </label>
                  <select
                    value={clientSector}
                    onChange={(e) => {
                      const val = e.target.value as ClientSector;
                      setClientSector(val);
                      const found = SECTOR_OPTIONS.find((s) => s.value === val);
                      if (found) setClientLogoEmoji(found.icon);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                  >
                    {SECTOR_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.icon} {s.label_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monthly Package Targets */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-extrabold text-slate-800">
                  تفاصيل الباقة الشهرية المتفق عليها (Monthly Retainer & Deliverables):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      عدد البوستات
                    </label>
                    <input
                      type="number"
                      value={postsTarget}
                      onChange={(e) => setPostsTarget(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-en font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      عدد الريلز (Reels)
                    </label>
                    <input
                      type="number"
                      value={reelsTarget}
                      onChange={(e) => setReelsTarget(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-en font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      عدد التصميمات
                    </label>
                    <input
                      type="number"
                      value={designsTarget}
                      onChange={(e) => setDesignsTarget(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-en font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      قيمة الباقة ($)
                    </label>
                    <input
                      type="number"
                      value={monthlyRetainer}
                      onChange={(e) =>
                        setMonthlyRetainer(Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-en font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      ميزانية الإعلانات ($)
                    </label>
                    <input
                      type="number"
                      value={adBudgetUsd}
                      onChange={(e) => setAdBudgetUsd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-en font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Hex Color Pickers */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                <p className="text-xs font-extrabold text-slate-900">
                  ألوان الهوية البصرية (Hex Color Pickers — تُحقن في برومبتات التصميم):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {brandColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5"
                    >
                      <input
                        type="color"
                        value={col.hex}
                        onChange={(e) =>
                          handleUpdateColor(idx, "hex", e.target.value)
                        }
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) =>
                            handleUpdateColor(idx, "name", e.target.value)
                          }
                          className="w-full text-[11px] font-bold text-slate-800 border-b border-slate-100 focus:outline-none"
                        />
                        <p className="text-[10px] font-en font-bold text-slate-500">
                          {col.hex}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tone of Voice & USP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نبرة الصوت (Tone of Voice):
                  </label>
                  <textarea
                    rows={2}
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الميزة التنافسية والجمهور (USP & Target Audience):
                  </label>
                  <textarea
                    rows={2}
                    value={uspMessages}
                    onChange={(e) => setUspMessages(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    المسموحات (DO&apos;s - سطر لكل توجيه):
                  </label>
                  <textarea
                    rows={2}
                    value={dosInput}
                    onChange={(e) => setDosInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-800 mb-1">
                    المحظورات الصارمة (DON&apos;Ts - يمنع الـ AI من استخدامها):
                  </label>
                  <textarea
                    rows={2}
                    value={dontsInput}
                    onChange={(e) => setDontsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-red-200 bg-red-50/30 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ العميل وتفعيل خزنة الهوية في الـ AI Copilot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
