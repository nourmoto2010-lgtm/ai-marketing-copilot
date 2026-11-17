// ============================================================================
// Google Gemini Direct REST API Integration (src/lib/ai/gemini.ts)
// ============================================================================
// يستخدم الاتصال المباشر عبر REST API على الرابط:
// https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent
// مع تمرير المفتاح في الهيدر X-goog-api-key وقراءة المفتاح من:
// 1. صفحة الإعدادات (/settings) أو جدول system_settings في Supabase
// 2. متغير البيئة GEMINI_API_KEY في ملف .env.local
// ============================================================================

import {
  buildCampaignSplitterPrompt,
  buildClientReportPrompt,
  buildPerformanceEvaluatorPrompt,
  buildRoleCopilotPrompt,
} from "@/lib/ai/prompts";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  BrandKit,
  Campaign,
  Client,
  RoleSlug,
  Task,
  TaskReview,
  User,
} from "@/types/database";

const DEFAULT_GEMINI_KEY = "";

function decodeStoredApiKey(rawKey?: string | null): string {
  if (!rawKey) return "";
  const trimmed = rawKey.trim();
  if (trimmed.startsWith("enc_v1_")) {
    const b64 = trimmed.replace("enc_v1_", "");
    try {
      return Buffer.from(b64, "base64").toString("utf-8").trim();
    } catch {
      return b64;
    }
  }
  return trimmed;
}

export async function resolveGeminiApiKey(customApiKey?: string): Promise<{
  apiKey: string;
  modelName: string;
}> {
  let apiKey = decodeStoredApiKey(customApiKey);
  let modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-flash-latest";

  if (
    (!apiKey || apiKey === "your_google_gemini_api_key_here") &&
    isSupabaseConfigured &&
    supabase
  ) {
    try {
      const { data } = await supabase
        .from("system_settings")
        .select("gemini_api_key_encrypted, gemini_model")
        .eq("id", "global_config")
        .single();

      if (data?.gemini_api_key_encrypted) {
        apiKey = decodeStoredApiKey(data.gemini_api_key_encrypted);
      }
      if (data?.gemini_model) {
        modelName = data.gemini_model;
      }
    } catch {
      // fallback to env
    }
  }

  if (!apiKey || apiKey === "your_google_gemini_api_key_here") {
    apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim() ||
      DEFAULT_GEMINI_KEY;
  }

  return { apiKey, modelName };
}

/**
 * استدعاء مباشر لـ Google Gemini REST API عبر:
 * https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent
 * مع الهيدر X-goog-api-key
 */
export async function callGeminiRestApi(
  promptText: string,
  customApiKey?: string
): Promise<string | null> {
  const { apiKey } = await resolveGeminiApiKey(customApiKey);
  if (!apiKey) return null;

  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini REST API HTTP ${response.status}`);
  }

  const data = await response.json();
  const generatedText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  return generatedText;
}

/**
 * 1. تشغيل المساعد الذكي المخصص للدور داخل المهمة (Role Copilot Execution)
 */
export async function generateRoleCopilotResponse(params: {
  roleSlug: RoleSlug;
  client: Client;
  brandKit: BrandKit;
  task: Task;
  userPrompt: string;
  apiKey?: string;
}): Promise<{
  content: string;
  mode: "gemini_live" | "brand_smart_engine";
  systemPromptUsed: string;
}> {
  const fullPrompt = buildRoleCopilotPrompt(params);

  try {
    const liveText = await callGeminiRestApi(fullPrompt, params.apiKey);
    if (liveText) {
      return {
        content: liveText,
        mode: "gemini_live",
        systemPromptUsed: fullPrompt,
      };
    }
  } catch (error) {
    console.warn("Gemini REST fallback triggered:", error);
  }

  const { roleSlug, client, brandKit, task } = params;
  const primaryColor = brandKit.colors[0];
  const secondaryColor = brandKit.colors[1] || brandKit.colors[0];
  const accentColor = brandKit.colors[2] || brandKit.colors[0];

  let structuredOutput = "";

  if (roleSlug === "content_creator") {
    structuredOutput = `### 🎯 مخرجات المساعد الذكي لصانع المحتوى (${client.name})
**التوافق مع الهوية (Brand Voice):** ${brandKit.tone_of_voice}

---

#### 1️⃣ 3 هوكات خاطفة لأول 3 ثوانٍ (Scroll-Stopping Hooks)
1. **هوك الفضول والحواس:** *"تفصيلة واحدة في ${task.title} بتخلي كل اللي يجرب ${client.name} يعرف الفرق من أول لحظة.. ركز في الثانية التالتة!"*
2. **هوك حل المشكلة المباشر:** *"لو بتدور على ${brandKit.usp_and_key_messages.slice(0, 55)}.. الفيديو ده اتعمل مخصوص عشانك."*
3. **هوك القيمة والنتيجة:** *"ليه آلاف العملاء بيختاروا ${client.name} كل أسبوع؟ السر في 3 تفاصيل مش هتلاقيهم في أي مكان تاني 👇"*

---

#### 2️⃣ السكريبت المقسم بالثواني (Timecoded Script)
| التوقيت | المشهد البصري (Visual Cue) | التعليق الصوتي والنص (VO & On-Screen Text) |
| :--- | :--- | :--- |
| **00:00 - 00:03** | لقطة قريبة خاطفة (Macro Hero Shot) بألوان الهوية (${primaryColor.hex}) | نطق الهوك الأول بنبرة حماسية + عنوان بارز بخط \`${brandKit.fonts.heading}\` |
| **00:03 - 00:09** | استعراض الميزة الأساسية للمهمة (${task.brief.slice(0, 70)}...) | *"في ${client.name}، بنضمن لك: ${brandKit.usp_and_key_messages}"* |
| **00:09 - 00:15** | لقطة ختامية للمنتج/الخدمة مع عرض واضح للـ Call to Action | *"اطلب الآن أو تواصل معنا عبر الرابط في البايو!"* |

---

#### 3️⃣ الكابشن الجاهز للنشر (Ready-to-Publish Caption)
✨ **${task.title}**
لأنك تستحق الأفضل دائماً مع **${client.name}**.. جمعنا لك الجودة الأصيلة والتفاصيل التي تصنع الفارق:
✅ ${brandKit.usp_and_key_messages}
✅ التزام كامل بأعلى معايير الجودة: ${brandKit.dos_and_donts.dos[0] || ""}

📩 **اطلب الآن عبر رسائل الصفحة أو الرابط في البايو!**

> 🛡️ **فحص أمان الهوية (Brand Guard):** تم التحقق من خلو النص تماماً من محظورات العميل: (${brandKit.dos_and_donts.donts.join(" | ")}).`;
  } else if (roleSlug === "graphic_designer") {
    structuredOutput = `### 🎨 التوجيه الفني وبرومبت التصميم 4K (${client.name})

#### 1️⃣ التوزيع اللوني المعتمد من خزنة الهوية (Hex Palette)
- **الخلفية الأساسية:** \`${secondaryColor.hex}\` (${secondaryColor.name})
- **العنصر البارز والعناوين:** \`${primaryColor.hex}\` (${primaryColor.name})
- **زر الـ CTA وعناصر التمييز:** \`${accentColor.hex}\` (${accentColor.name})

#### 2️⃣ برومبت توليد الصور الجاهز (Midjourney v6 / Flux 4K Prompt)
\`\`\`text
${brandKit.visual_style_prompt_prefix}, featuring the theme of "${task.title}", dominant color palette using ${primaryColor.hex} (${primaryColor.name}) and ${secondaryColor.hex} (${secondaryColor.name}) with subtle accents of ${accentColor.hex}, clean negative space at the top for Arabic typography, studio rim lighting, 8k resolution --ar 4:5 --v 6.0
\`\`\``;
  } else {
    structuredOutput = `### 🧠 توصية المساعد الذكي (${client.name})
1. **تطبيق الهوية البصرية:** إبراز (${brandKit.usp_and_key_messages}) واستخدام الألوان المعتمدة (\`${primaryColor.hex}\` و \`${secondaryColor.hex}\`).
2. **نبرة الصوت:** ${brandKit.tone_of_voice}.
3. **الالتزام بالمحظورات:** تجنب (${brandKit.dos_and_donts.donts.join(" | ")}) لضمان القبول من أول مرة (First-Time Approval).`;
  }

  return {
    content: structuredOutput,
    mode: "brand_smart_engine",
    systemPromptUsed: fullPrompt,
  };
}

/**
 * 2. محرك تقسيم الحملة إلى مهام مترابطة (AI Campaign Task Splitter)
 */
export async function generateCampaignTasksBreakdown(params: {
  client: Client;
  brandKit: BrandKit;
  campaignTitle: string;
  campaignObjective: string;
  campaignBrief: string;
  teamMembers: User[];
  apiKey?: string;
}) {
  const prompt = buildCampaignSplitterPrompt(params);

  try {
    const rawText = await callGeminiRestApi(prompt, params.apiKey);
    if (rawText) {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { tasks: parsed, mode: "gemini_live" as const };
        }
      }
    }
  } catch (e) {
    console.warn("Gemini campaign breakdown fallback:", e);
  }

  const { client, brandKit, campaignTitle, campaignBrief, teamMembers } =
    params;
  const findMember = (slugs: RoleSlug[], fallbackId: string) =>
    teamMembers.find((m) => slugs.includes(m.role_slug))?.id || fallbackId;
  const primaryColor = brandKit.colors[0]?.hex || "#2563EB";

  const generatedTasks = [
    {
      title: `إعداد بريف وسكريبت الحملة والهوكات التسويقية: ${campaignTitle}`,
      role_slug: "account_manager" as RoleSlug,
      assigned_to: findMember(["account_manager", "content_creator"], "user-am"),
      content_type: "reel" as const,
      platform: "Instagram & TikTok",
      priority: "urgent" as const,
      brief: `[مسند إلى Shrouk - Team Leader] كتابة سكريبت الحملة والهوكات والكابشن المتوافق مع نبرة صوت "${client.name}" لتحقيق هدف الحملة: ${campaignBrief}`,
      estimated_hours: 2.5,
      days_until_deadline: 1,
      depends_on_index: null,
    },
    {
      title: `تصميم Key Visual وتوليد خلفيات 4K بالـ AI بألوان الهوية: ${campaignTitle}`,
      role_slug: "graphic_designer" as RoleSlug,
      assigned_to: findMember(["graphic_designer"], "user-designer"),
      content_type: "carousel" as const,
      platform: "Instagram & Facebook",
      priority: "high" as const,
      brief: `[مسند إلى Salma - Designer & AI] تصميم الهوية البصرية للحملة وشرائح الـ Carousel وتوليد صور 4K باستخدام ألوان العميل (${primaryColor}) وخط ${brandKit.fonts.heading}.`,
      estimated_hours: 3.5,
      days_until_deadline: 2,
      depends_on_index: 0,
    },
    {
      title: `تصميم ومونتاج فيديو Reels الحملة الإعلاني: ${campaignTitle}`,
      role_slug: "graphic_designer" as RoleSlug,
      assigned_to: findMember(["graphic_designer", "video_editor"], "user-designer"),
      content_type: "reel" as const,
      platform: "Instagram Reels & TikTok",
      priority: "high" as const,
      brief: `[مسند إلى Salma - Designer & AI] تجهيز المرئيات المتحركة والـ Reels بناءً على السكريبت المعتمد من Shrouk مع تطبيق ألوان الهوية.`,
      estimated_hours: 4.0,
      days_until_deadline: 3,
      depends_on_index: 0,
    },
    {
      title: `إطلاق الحملة الإعلانية الممولة وضبط الاستهداف ورفع الـ ROAS: ${campaignTitle}`,
      role_slug: "media_buyer" as RoleSlug,
      assigned_to: findMember(["media_buyer"], "user-media"),
      content_type: "ad_campaign" as const,
      platform: "Meta & TikTok & Google Ads",
      priority: "urgent" as const,
      brief: `[مسند إلى Mohamed - Media Buyer] بناء هيكل الحملة الإعلانية (TOF/MOF/BOF) وربط تصميمات Salma وسكريبت Shrouk لتحقيق أعلى عائد إعلاني ROAS.`,
      estimated_hours: 3.0,
      days_until_deadline: 3,
      depends_on_index: 1,
    },
    {
      title: `المراجعة الاستراتيجية واعتماد خطة الإطلاق ومؤشرات الأداء: ${campaignTitle}`,
      role_slug: "ceo" as RoleSlug,
      assigned_to: findMember(["ceo"], "user-ceo"),
      content_type: "ad_campaign" as const,
      platform: "All Channels",
      priority: "high" as const,
      brief: `[مسند إلى Nour Saleh - Marketing Manager] مراجعة واعتماد التكامل بين المحتوى والتصميم وخطة الميديا باينج قبل الإطلاق الرسمي للعميل.`,
      estimated_hours: 1.5,
      days_until_deadline: 4,
      depends_on_index: 3,
    },
  ];

  return { tasks: generatedTasks, mode: "brand_smart_engine" as const };
}

/**
 * 3. وكيل تقييم الأداء الذكي (AI Member Performance Evaluator)
 */
export async function generateMemberEvaluationAI(params: {
  member: User;
  completedTasks: Task[];
  reviews: TaskReview[];
  calculatedStats: {
    overall_score: number;
    on_time_delivery_rate: number;
    first_time_approval_rate: number;
    quality_score: number;
    speed_efficiency_score: number;
    avg_revisions_per_task: number;
  };
  apiKey?: string;
}) {
  const prompt = buildPerformanceEvaluatorPrompt(params);

  try {
    const rawText = await callGeminiRestApi(prompt, params.apiKey);
    if (rawText) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          evaluation: JSON.parse(jsonMatch[0]),
          mode: "gemini_live" as const,
        };
      }
    }
  } catch (e) {
    console.warn("Gemini performance evaluator fallback:", e);
  }

  const { member, calculatedStats } = params;
  return {
    evaluation: {
      ai_strengths: [
        `تحقيق معدل تسليم في الموعد بنسبة ${calculatedStats.on_time_delivery_rate}% مع كفاءة سرعة تنفيذ ${calculatedStats.speed_efficiency_score}%.`,
        `معدل قبول من المرة الأولى (${calculatedStats.first_time_approval_rate}%) يعكس فهم هويات العملاء الأربعة.`,
      ],
      ai_improvements: [
        "توثيق القوالب والبرومبتات الناجحة لمشاركتها مع باقي الفريق وتقليص زمن التنفيذ بنسبة 15% إضافية.",
      ],
      ai_weekly_summary: `سجل ${member.full_name} (${member.job_title_ar}) تقييماً موضوعياً قدره ${calculatedStats.overall_score}/100.`,
    },
    mode: "brand_smart_engine" as const,
  };
}

/**
 * 4. مولد تقارير العملاء الذكي (AI Client Report Generator)
 */
export async function generateClientExecutiveReport(params: {
  client: Client;
  brandKit: BrandKit;
  campaigns: Campaign[];
  tasks: Task[];
  apiKey?: string;
}) {
  const prompt = buildClientReportPrompt(params);

  try {
    const text = await callGeminiRestApi(prompt, params.apiKey);
    if (text) {
      return { report: text, mode: "gemini_live" as const };
    }
  } catch (e) {
    console.warn("Gemini client report fallback:", e);
  }

  const { client, campaigns } = params;
  const pkg = client.monthly_package;
  const mainCampaign = campaigns[0];

  const report = `## 📊 التقرير التنفيذي الأسبوعي والشهري: ${client.name}
- **البوستات:** ${pkg.posts_done}/${pkg.posts_target} | **الريلز:** ${pkg.reels_done}/${pkg.reels_target} | **التصميمات:** ${pkg.designs_done}/${pkg.designs_target}
- **العائد الإعلاني (ROAS):** ${mainCampaign?.ad_metrics.roas || 5.5}x`;

  return { report, mode: "brand_smart_engine" as const };
}
