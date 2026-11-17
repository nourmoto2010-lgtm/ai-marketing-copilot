// ============================================================================
// AI Marketing Team Copilot & Client Hub - Database TypeScript Definitions
// Maps 1:1 to the 8 PostgreSQL tables in supabase/schema.sql
// ============================================================================

export type RoleSlug =
  | "ceo"
  | "account_manager"
  | "content_creator"
  | "graphic_designer"
  | "video_editor"
  | "media_buyer"
  | "moderation";

export type AccessLevel = "director" | "team_lead" | "member";

export type ClientSector =
  | "food_sweets"
  | "cafes"
  | "pharmacies"
  | "industry_export";

export type ClientStatus = "active" | "onboarding" | "paused";

export type CampaignStatus = "planning" | "active" | "completed";

export type ContentType =
  | "reel"
  | "static_post"
  | "carousel"
  | "ad_campaign"
  | "moderation_plan"
  | "motion_video";

export type TaskStatus =
  | "backlog"
  | "in_progress"
  | "in_review"
  | "revision_requested"
  | "approved"
  | "published";

export type TaskPriority = "urgent" | "high" | "medium" | "low";

export type ReviewDecision = "approved" | "revision_requested";

export interface RolePermissions {
  can_approve: boolean;
  can_split_campaigns: boolean;
  can_view_all_scores: boolean;
  can_manage_clients: boolean;
  can_generate_reports: boolean;
}

export interface CopilotQuickTool {
  id: string;
  label_ar: string;
  prompt_template: string;
  badge_en: string;
}

// 1. roles
export interface Role {
  id: string;
  slug: RoleSlug;
  name_ar: string;
  name_en: string;
  description_ar: string;
  permissions: RolePermissions;
  default_copilot_tools: CopilotQuickTool[];
}

// 2. users
export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  role_id: string;
  role_slug: RoleSlug;
  access_level: AccessLevel;
  job_title_ar: string;
  specialty_tags: string[];
  assigned_client_ids?: string[];
  is_active: boolean;
}

export interface KpiWeightsConfig {
  on_time_weight: number; // default 40%
  first_time_approval_weight: number; // default 35%
  speed_quality_weight: number; // default 25%
}

export interface SystemSettings {
  id: string;
  gemini_api_key_encrypted: string;
  gemini_model: string;
  kpi_weights: KpiWeightsConfig;
  updated_at: string;
}

// 3. clients
export interface MonthlyPackage {
  package_name: string;
  monthly_retainer_usd: number;
  posts_target: number;
  posts_done: number;
  reels_target: number;
  reels_done: number;
  designs_target: number;
  designs_done: number;
  ad_budget_usd: number;
  ad_spend_usd: number;
}

export interface Client {
  id: string;
  name: string;
  name_en: string;
  sector: ClientSector;
  sector_label_ar: string;
  logo_url: string;
  cover_color: string;
  account_manager_id: string;
  monthly_package: MonthlyPackage;
  status: ClientStatus;
}

// 4. brand_kits
export interface BrandColor {
  name: string;
  hex: string;
  usage: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
  english: string;
}

export interface BrandKit {
  id: string;
  client_id: string;
  colors: BrandColor[];
  fonts: BrandFonts;
  tone_of_voice: string;
  target_audience: string;
  usp_and_key_messages: string;
  dos_and_donts: {
    dos: string[];
    donts: string[];
  };
  social_links: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    website?: string;
    linkedin?: string;
  };
  visual_style_prompt_prefix: string;
}

// 5. campaigns
export interface AdMetrics {
  budget_usd: number;
  spend_usd: number;
  roas: number;
  ctr: number;
  cpl_usd: number;
  conversions: number;
  impressions: number;
}

export interface Campaign {
  id: string;
  client_id: string;
  title: string;
  objective: string;
  brief: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  ad_metrics: AdMetrics;
}

export interface TaskComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  message: string;
  is_question?: boolean;
  created_at: string;
}

// 6. tasks
export interface TaskDeliverable {
  hook_options?: string[];
  script_or_caption?: string;
  design_prompt_en?: string;
  design_dimensions?: string;
  video_checklist?: { item: string; done: boolean }[];
  ad_recommendations?: string[];
  moderation_faq?: { question: string; reply: string }[];
  notes?: string;
  comments?: TaskComment[];
}

export interface Task {
  id: string;
  campaign_id: string;
  client_id: string;
  assigned_to: string;
  role_slug: RoleSlug;
  title: string;
  brief: string;
  content_type: ContentType;
  platform: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  scheduled_publish_date: string;
  deadline: string;
  estimated_hours: number;
  actual_hours?: number;
  delivered_at?: string;
  revision_count: number;
  deliverable_content: TaskDeliverable;
}

// 7. task_reviews
export interface TaskReview {
  id: string;
  task_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  quality_rating: number; // 1.0 to 10.0
  feedback_notes: string;
  is_first_time_approval: boolean;
  created_at: string;
}

// 8. performance_scores
export interface PerformanceScore {
  id: string;
  user_id: string;
  period_label: string;
  overall_score: number; // 0 - 100
  on_time_delivery_rate: number; // %
  first_time_approval_rate: number; // %
  quality_score: number; // %
  speed_efficiency_score: number; // %
  tasks_completed: number;
  avg_revisions_per_task: number;
  ai_strengths: string[];
  ai_improvements: string[];
  ai_weekly_summary: string;
  evaluated_at: string;
}
