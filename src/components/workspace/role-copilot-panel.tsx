"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  FileCode2,
  Palette,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Type,
  UserCheck,
  Wand2,
} from "lucide-react";
import { BrandKit, Client, CopilotQuickTool, Role, Task, User } from "@/types/database";
import { useAppStore } from "@/lib/store/app-context";
import { cn, ROLE_LABELS } from "@/lib/utils";

interface RoleCopilotPanelProps {
  task: Task;
  assignee: User;
  client: Client;
  brandKit: BrandKit;
  role: Role;
  onApplyToDeliverable: (generatedText: string) => void;
}

/**
 * يبني أزرار المساعدة السريعة ديناميكياً حسب دور الموظف المسند إليه التاسك
 * مع حقن بيانات الـ Brand Kit (الألوان، نبرة الصوت، الخطوط، الجمهور، والمحظورات) تلقائياً في كل زر.
 */
function buildBrandAwareRoleButtons(
  role: Role,
  client: Client,
  brandKit: BrandKit,
  task: Task
): CopilotQuickTool[] {
  const primaryHex = brandKit.colors[0]?.hex || "#0F172A";
  const secondaryHex = brandKit.colors[1]?.hex || "#2563EB";
  const accentHex = brandKit.colors[2]?.hex || "#6366F1";
  const headingFont = brandKit.fonts.heading;
  const dontsSummary = brandKit.dos_and_donts.donts[0] || "مخالفة الهوية";

  switch (role.slug) {
    case "content_creator":
      return [
        {
          id: "cc-hooks-brand",
          label_ar: `اكتب 3 هوكات لريلز (${client.name})`,
          badge_en: "3 Brand Hooks",
          prompt_template: `اكتب لي 3 هوكات خاطفة (Scroll-Stopping Hooks) لأول 3 ثوانٍ في مهمة "${task.title}" خاصة بالعميل "${client.name}"، مع الالتزام بنبرة الصوت (${brandKit.tone_of_voice}) وتجنب (${dontsSummary}).`,
        },
        {
          id: "cc-script-brand",
          label_ar: "توليد سكريبت Reels كامل بالثواني + كابشن",
          badge_en: "Reels Script + Caption",
          prompt_template: `اكتب سكريبت Reels مقسماً بالثواني (المشهد البصري + التعليق الصوتي) مع كابشن جاهز للنشر و CTA يخاطب (${brandKit.target_audience}) ويبرز (${brandKit.usp_and_key_messages}).`,
        },
        {
          id: "cc-carousel-brand",
          label_ar: "تحويل البريف إلى شرائح Carousel",
          badge_en: "Carousel Copy",
          prompt_template: `حول بريف المهمة "${task.title}" إلى 5 شرائح Carousel متسلسلة متوافقة مع هوية "${client.name}" ونبرة صوته، مع كتابة الكابشن والهاشتاجات.`,
        },
      ];

    case "graphic_designer":
      return [
        {
          id: "gd-4k-prompt",
          label_ar: `حول البريف لبرومبت تصميم 4K بألوان (${primaryHex} / ${secondaryHex})`,
          badge_en: "4K AI Visual Prompt",
          prompt_template: `حول بريف مهمة "${task.title}" للعميل "${client.name}" إلى 2 برومبت تصميم 4K احترافي بالإنجليزية (Midjourney v6 / Flux) يدمج ألوان البراند (${primaryHex} و ${secondaryHex} و ${accentHex}) وأسلوب (${brandKit.visual_style_prompt_prefix}).`,
        },
        {
          id: "gd-art-direction",
          label_ar: `خطة التوجيه الفني وتوزيع خط (${headingFont})`,
          badge_en: "Art Direction & Grid",
          prompt_template: `اقترح التوجيه الفني (Art Direction) وتوزيع العناصر البصرية وتطبيق لوحة ألوان العميل (${primaryHex}, ${secondaryHex}) وخط (${headingFont}) لمهمة "${task.title}".`,
        },
        {
          id: "gd-variations",
          label_ar: "توليد 3 زوايا بصرية لإعلانات A/B Testing",
          badge_en: "3 Ad Creatives",
          prompt_template: `اقترح 3 أفكار تصميمية مختلفة (Visual Concepts) لنفس البريف لاختبارها إعلانياً مع برومبت لكل تصميم يلتزم بهوية "${client.name}".`,
        },
      ];

    case "video_editor":
      return [
        {
          id: "ve-storyboard-sfx",
          label_ar: "بناء Storyboard بالثواني + مؤثرات صوتية SFX",
          badge_en: "Storyboard & SFX",
          prompt_template: `حول مهمة "${task.title}" للعميل "${client.name}" إلى جدول ستوري بورد مقسم بالثواني يحدد اللقطات، الانتقالات (Transitions)، المؤثرات الصوتية (SFX)، والنصوص المتحركة بخط (${headingFont}) وألوان (${primaryHex}).`,
        },
        {
          id: "ve-retention-hooks",
          label_ar: "خطة مونتاج أول 3 ثوانٍ لرفع الـ Retention",
          badge_en: "Hook Pacing",
          prompt_template: `اقترح 3 طرق مونتاج بصري وصوتي (Visual & Audio Hook Editing) لأول 3 ثوانٍ من فيديو "${task.title}" لجذب (${brandKit.target_audience}).`,
        },
        {
          id: "ve-qc-checklist",
          label_ar: "فحص قائمة الجودة (Safe Zones & Brand Colors)",
          badge_en: "Pre-Delivery QC",
          prompt_template: `أنشئ قائمة مراجعة فنية (Quality Checklist) مخصصة لفيديو "${task.title}" لضمان القبول من أول مرة (First-Time Approval) ومطابقة هوية "${client.name}".`,
        },
      ];

    case "media_buyer":
      return [
        {
          id: "mb-roas-plan",
          label_ar: `خطة استهداف ورفع ROAS لحملة (${client.name})`,
          badge_en: "Targeting & ROAS",
          prompt_template: `بناءً على جمهور "${client.name}" (${brandKit.target_audience}) وميزته التنافسية (${brandKit.usp_and_key_messages})، ضع خطة استهداف (TOF/MOF/BOF) وتوزيع ميزانية لمهمة "${task.title}".`,
        },
        {
          id: "mb-ab-testing",
          label_ar: "مصفوفة اختبارات A/B لتقليل الـ CPL",
          badge_en: "CPL Optimizer",
          prompt_template: `اقترح خطة اختبارات A/B (للـ Creatives والهوكات والشرائح) لخفض تكلفة النتيجة (CPL/CPA) ورفع الـ CTR في حملة "${task.title}".`,
        },
        {
          id: "mb-ad-angles",
          label_ar: "توليد 3 نصوص إعلانية (Primary Ad Copy) للـ Ads Manager",
          badge_en: "Ad Copy Angles",
          prompt_template: `اكتب 3 نصوص إعلانية بيعية جاهزة لحملة "${task.title}" متوافقة مع نبرة صوت "${client.name}" وتركز على التحويل المباشر.`,
        },
      ];

    case "moderation":
      return [
        {
          id: "mod-dm-funnel",
          label_ar: `سيناريو تحويل التعليقات لمبيعات في الـ DM (${client.name})`,
          badge_en: "DM Sales Funnel",
          prompt_template: `أنشئ سيناريو محادثة كامل (DM Sales Script) لتحويل استفسارات الجمهور حول "${task.title}" إلى طلبات شراء مؤكدة لصالح "${client.name}" بنبرة (${brandKit.tone_of_voice}).`,
        },
        {
          id: "mod-faq-guard",
          label_ar: "دليل الردود القياسية بدون كسر محظورات العميل",
          badge_en: "Brand-Safe FAQ",
          prompt_template: `اكتب 5 أسئلة شائعة متوقعة على "${task.title}" مع ردودها النموذجية، مع الالتزام الصارم بعدم مخالفة محظورات العميل: (${brandKit.dos_and_donts.donts.join(" ، ")}).`,
        },
        {
          id: "mod-objections",
          label_ar: "الرد الدبلوماسي على اعتراضات السعر أو التأخير",
          badge_en: "Objection Handling",
          prompt_template: `صغ 3 ردود احترافية لمعالجة اعتراضات السعر أو الاستفسارات الحساسة لعميل "${client.name}" مع إبراز القيمة (${brandKit.usp_and_key_messages}).`,
        },
      ];

    default:
      return role.default_copilot_tools;
  }
}

export function RoleCopilotPanel({
  task,
  assignee,
  client,
  brandKit,
  role,
  onApplyToDeliverable,
}: RoleCopilotPanelProps) {
  const { geminiApiKey } = useAppStore();
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [responseContent, setResponseContent] = useState<string>("");
  const [responseMode, setResponseMode] = useState<string>("");
  const [systemPromptPreview, setSystemPromptPreview] = useState<string>("");
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic quick buttons tailored to the assigned employee's role + client's Brand Kit
  const dynamicQuickTools = useMemo(
    () => buildBrandAwareRoleButtons(role, client, brandKit, task),
    [role, client, brandKit, task]
  );

  // Reset output when switching task or changing assigned role
  useEffect(() => {
    setResponseContent("");
    setUserPrompt("");
    setActiveToolId(null);
  }, [task.id, task.role_slug, task.assigned_to, client.id]);

  const runCopilot = async (promptText: string, toolId?: string) => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setUserPrompt(promptText);
    if (toolId) setActiveToolId(toolId);

    try {
      const res = await fetch("/api/ai/role-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleSlug: role.slug,
          client,
          brandKit,
          task,
          userPrompt: promptText,
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setResponseContent(data.content);
        setResponseMode(data.mode || "brand_smart_engine");
        if (data.systemPromptUsed) {
          setSystemPromptPreview(data.systemPromptUsed);
        }
      }
    } catch (error) {
      setResponseContent("حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseContent) return;
    navigator.clipboard.writeText(responseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-ai-subtle p-5 space-y-4 shadow-sm">
      {/* Copilot Header: Shows Assigned Employee + Role Agent + Client Brand Kit Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-200/70 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ai-gradient text-white flex items-center justify-center shadow-ai-glow shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                المساعد الذكي المخصص للدور (Ask Role Copilot)
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>
                  {assignee.full_name} • {ROLE_LABELS[role.slug]?.ar}
                </span>
              </span>
              <span className="text-[10px] font-en font-bold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                {ROLE_LABELS[role.slug]?.en} Mode
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              تم تحميل خزنة هوية{" "}
              <span className="font-bold text-slate-900">
                {client.logo_url} {client.name}
              </span>{" "}
              تلقائياً وتخصيص أزرار المساعدة لدور{" "}
              <span className="font-bold text-indigo-700">
                {ROLE_LABELS[role.slug]?.ar}
              </span>
              .
            </p>
          </div>
        </div>

        {systemPromptPreview && (
          <button
            type="button"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="text-[11px] font-semibold text-indigo-700 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>
              {showSystemPrompt
                ? "إخفاء البرومبت المدمج"
                : "فحص System Prompt + Brand Kit"}
            </span>
          </button>
        )}
      </div>

      {/* Auto-Read Brand Kit Live Memory Card */}
      <div className="p-3.5 rounded-xl bg-white/95 border border-indigo-100 space-y-2.5 text-xs shadow-card-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-indigo-600" />
            ذاكرة هوية العميل المقروءة تلقائياً (Auto-Loaded Brand Kit):
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {brandKit.colors.map((c) => (
              <span
                key={c.hex}
                title={`${c.name} - ${c.usage}`}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-en font-bold text-slate-800"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                  style={{ backgroundColor: c.hex }}
                />
                {c.hex}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-en font-semibold text-blue-800">
              <Type className="w-3 h-3" />
              {brandKit.fonts.heading}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <strong className="text-slate-800">نبرة الصوت (Brand Voice): </strong>
            {brandKit.tone_of_voice}
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <strong className="text-slate-800 flex items-center gap-1 inline-flex">
              <Target className="w-3 h-3 text-indigo-600" /> الجمهور والـ USP:{" "}
            </strong>
            {brandKit.usp_and_key_messages}
          </div>
        </div>

        <div className="text-[11px] text-red-800 bg-red-50/80 px-3 py-1.5 rounded-lg border border-red-200/80 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span className="line-clamp-1">
            <strong>فلتر المحظورات النشط (Brand Guard DON&apos;Ts):</strong>{" "}
            {brandKit.dos_and_donts.donts.join(" | ")}
          </span>
        </div>
      </div>

      {/* Role-Specific Dynamic Quick Action Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-slate-800">
            أزرار المساعدة السريعة المخصصة لدور ({ROLE_LABELS[role.slug]?.ar}):
          </p>
          <span className="text-[11px] text-indigo-700 font-semibold">
            تتغير تلقائياً حسب الموظف المسند إليه التاسك
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {dynamicQuickTools.map((tool) => {
            const isSelected = activeToolId === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => runCopilot(tool.prompt_template, tool.id)}
                disabled={isLoading}
                className={cn(
                  "p-3 rounded-xl border text-right transition flex flex-col justify-between gap-2 shadow-sm disabled:opacity-50",
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-ai-glow"
                    : "bg-white hover:bg-indigo-50/80 text-slate-800 border-indigo-200 hover:border-indigo-400"
                )}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span
                    className={cn(
                      "text-[10px] font-en font-bold px-2 py-0.5 rounded-md",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-indigo-50 text-indigo-700"
                    )}
                  >
                    {tool.badge_en}
                  </span>
                  <Wand2
                    className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      isSelected ? "text-white" : "text-indigo-500"
                    )}
                  />
                </div>
                <span className="text-xs font-bold leading-snug">
                  {tool.label_ar}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prompt Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCopilot(userPrompt, "custom");
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder={`اطلب أي مساعدة مخصصة كـ ${ROLE_LABELS[role.slug]?.ar} لعميل ${client.name}...`}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !userPrompt.trim()}
          className="px-5 py-2.5 rounded-xl bg-ai-gradient text-white text-xs font-bold shadow-ai-glow hover:opacity-95 transition flex items-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isLoading ? "جاري التوليد..." : "اسأل المساعد الذكي"}</span>
        </button>
      </form>

      {/* Optional System Prompt Inspector */}
      {showSystemPrompt && systemPromptPreview && (
        <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-700">
          {systemPromptPreview}
        </div>
      )}

      {/* Generated Output Box */}
      {responseContent && (
        <div className="p-4 rounded-xl bg-white border-2 border-indigo-300 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              مخرجات المساعد الذكي لـ ({assignee.full_name} — {ROLE_LABELS[role.slug]?.ar}):
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-en px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                {responseMode === "gemini_live"
                  ? "Gemini 2.0 Live"
                  : "Brand Kit Smart AI"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    نسخ المخرجات
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onApplyToDeliverable(responseContent)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
              >
                إدراج في تسليم المهمة ✓
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto font-cairo">
            {responseContent}
          </div>
        </div>
      )}
    </div>
  );
}
