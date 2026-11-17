import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContentType, RoleSlug, TaskPriority, TaskStatus } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROLE_LABELS: Record<
  RoleSlug,
  { ar: string; en: string; badgeClass: string }
> = {
  ceo: {
    ar: "المدير العام (CEO)",
    en: "Agency Director",
    badgeClass: "bg-slate-900 text-white border-slate-800",
  },
  account_manager: {
    ar: "مدير الحسابات (AM)",
    en: "Account Manager",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  content_creator: {
    ar: "صانع محتوى",
    en: "Content Creator",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  graphic_designer: {
    ar: "مصمم جرافيك و AI",
    en: "Graphic & AI Designer",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  video_editor: {
    ar: "مونتير فيديو وموشن",
    en: "Video & Motion Editor",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  media_buyer: {
    ar: "خبير إعلانات ممولة",
    en: "Media Buyer",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  moderation: {
    ar: "إدارة مجتمعات ومبيعات",
    en: "Moderation Specialist",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
};

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label_ar: string; label_en: string; colorClass: string; dotColor: string }
> = {
  backlog: {
    label_ar: "قائمة الانتظار",
    label_en: "Backlog",
    colorClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
  },
  in_progress: {
    label_ar: "قيد التنفيذ",
    label_en: "In Progress",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-600",
  },
  in_review: {
    label_ar: "بانتظار المراجعة",
    label_en: "In Review",
    colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dotColor: "bg-indigo-600",
  },
  revision_requested: {
    label_ar: "مطلوب تعديل",
    label_en: "Revision Requested",
    colorClass: "bg-amber-50 text-amber-800 border-amber-300",
    dotColor: "bg-amber-500",
  },
  approved: {
    label_ar: "معتمد",
    label_en: "Approved",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  published: {
    label_ar: "تم النشر / الإطلاق",
    label_en: "Published",
    colorClass: "bg-teal-50 text-teal-800 border-teal-200",
    dotColor: "bg-teal-600",
  },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label_ar: string; label_en: string; className: string }
> = {
  urgent: {
    label_ar: "عاجل جداً",
    label_en: "Urgent",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  high: {
    label_ar: "مرتفعة",
    label_en: "High",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  medium: {
    label_ar: "متوسطة",
    label_en: "Medium",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  low: {
    label_ar: "عادية",
    label_en: "Low",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export const CONTENT_TYPE_META: Record<
  ContentType,
  { label_ar: string; label_en: string }
> = {
  reel: { label_ar: "فيديو ريلز", label_en: "Reels Video" },
  static_post: { label_ar: "بوست تصميم", label_en: "Static Post" },
  carousel: { label_ar: "ألبوم شرائح", label_en: "Carousel Grid" },
  ad_campaign: { label_ar: "حملة ممولة", label_en: "Ad Campaign" },
  moderation_plan: { label_ar: "خطة ردود ومبيعات", label_en: "Moderation Playbook" },
  motion_video: { label_ar: "فيديو موشن", label_en: "Motion Graphics" },
};
