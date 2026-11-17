-- ============================================================================
-- AI Marketing Team Copilot & Client Hub
-- Complete Production SQL Schema + RLS Policies + Initial Seed Data for Supabase
-- ============================================================================
-- طريقة الاستخدام:
-- انسخ هذا الملف بالكامل والصقه في (Supabase Dashboard -> SQL Editor -> New Query)
-- ثم اضغط على (Run). سيقوم بإنشاء جميع الجداول الـ 9، وتفعيل الصلاحيات (RLS)،
-- وإدراج البيانات الأساسية للأدوار والعملاء والفريق والإعدادات.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. جدول الأدوار الوظيفية (roles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  name_ar VARCHAR(120) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  description_ar TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{
    "can_approve": false,
    "can_split_campaigns": false,
    "can_view_all_scores": false,
    "can_manage_clients": false,
    "can_generate_reports": false
  }'::jsonb,
  default_copilot_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. جدول المستخدمين وأعضاء الفريق (users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  role_id VARCHAR(64) NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  role_slug VARCHAR(64) NOT NULL,
  access_level VARCHAR(32) NOT NULL DEFAULT 'member', -- 'director', 'team_lead', 'member'
  job_title_ar VARCHAR(150) NOT NULL,
  specialty_tags TEXT[] NOT NULL DEFAULT '{}',
  assigned_client_ids TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. جدول العملاء (clients)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  name_en VARCHAR(180) NOT NULL,
  sector VARCHAR(64) NOT NULL, -- 'food_sweets', 'cafes', 'pharmacies', 'industry_export'
  sector_label_ar VARCHAR(120) NOT NULL,
  logo_url TEXT DEFAULT '🏢',
  cover_color VARCHAR(32) NOT NULL DEFAULT '#2563EB',
  account_manager_id VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
  monthly_package JSONB NOT NULL DEFAULT '{
    "package_name": "Growth Retainer",
    "monthly_retainer_usd": 3000,
    "posts_target": 16,
    "posts_done": 0,
    "reels_target": 8,
    "reels_done": 0,
    "designs_target": 20,
    "designs_done": 0,
    "ad_budget_usd": 3500,
    "ad_spend_usd": 0
  }'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. جدول خزنة الهوية البصرية لكل عميل (brand_kits)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) UNIQUE NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  fonts JSONB NOT NULL DEFAULT '{"heading": "Cairo Bold", "body": "Cairo Regular", "english": "Inter SemiBold"}'::jsonb,
  tone_of_voice TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  usp_and_key_messages TEXT NOT NULL,
  dos_and_donts JSONB NOT NULL DEFAULT '{"dos": [], "donts": []}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  visual_style_prompt_prefix TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. جدول الحملات التسويقية (campaigns)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  objective VARCHAR(180) NOT NULL,
  brief TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  ad_metrics JSONB NOT NULL DEFAULT '{
    "budget_usd": 3000,
    "spend_usd": 0,
    "roas": 0,
    "ctr": 0,
    "cpl_usd": 0,
    "conversions": 0,
    "impressions": 0
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. جدول المهام وجدول المحتوى (tasks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(64) PRIMARY KEY,
  campaign_id VARCHAR(64) REFERENCES public.campaigns(id) ON DELETE CASCADE,
  client_id VARCHAR(64) NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_to VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  role_slug VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  brief TEXT NOT NULL,
  content_type VARCHAR(64) NOT NULL DEFAULT 'reel',
  platform VARCHAR(64) NOT NULL DEFAULT 'Instagram & TikTok',
  status VARCHAR(32) NOT NULL DEFAULT 'backlog', -- 'backlog', 'in_progress', 'in_review', 'revision_requested', 'approved', 'published'
  priority VARCHAR(32) NOT NULL DEFAULT 'high',
  dependencies TEXT[] NOT NULL DEFAULT '{}',
  scheduled_publish_date DATE DEFAULT CURRENT_DATE,
  deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 days'),
  estimated_hours NUMERIC(4,1) NOT NULL DEFAULT 3.0,
  actual_hours NUMERIC(4,1),
  delivered_at TIMESTAMPTZ,
  revision_count INTEGER NOT NULL DEFAULT 0,
  deliverable_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. جدول مراجعات المهام والاعتمادات (task_reviews)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_reviews (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reviewer_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  decision VARCHAR(32) NOT NULL, -- 'approved', 'revision_requested'
  quality_rating NUMERIC(3,1) NOT NULL CHECK (quality_rating >= 1.0 AND quality_rating <= 10.0),
  feedback_notes TEXT NOT NULL,
  is_first_time_approval BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. جدول تقييمات الأداء الذكية (performance_scores)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.performance_scores (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_label VARCHAR(120) NOT NULL DEFAULT 'نوفمبر 2026 - الأسبوع 3',
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  on_time_delivery_rate NUMERIC(5,2) NOT NULL,
  first_time_approval_rate NUMERIC(5,2) NOT NULL,
  quality_score NUMERIC(5,2) NOT NULL,
  speed_efficiency_score NUMERIC(5,2) NOT NULL,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  avg_revisions_per_task NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  ai_strengths TEXT[] NOT NULL DEFAULT '{}',
  ai_improvements TEXT[] NOT NULL DEFAULT '{}',
  ai_weekly_summary TEXT NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. جدول إعدادات النظام والمفاتيح وأوزان التقييم (system_settings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'global_config',
  gemini_api_key_encrypted TEXT DEFAULT '',
  gemini_model VARCHAR(64) NOT NULL DEFAULT 'gemini-2.0-flash',
  kpi_weights JSONB NOT NULL DEFAULT '{
    "on_time_weight": 40,
    "first_time_approval_weight": 35,
    "speed_quality_weight": 25
  }'::jsonb,
  updated_by VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Indexes for High-Performance Queries
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON public.campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_performance_scores_user_id ON public.performance_scores(user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies allowing authenticated and anon app clients full operational access
DROP POLICY IF EXISTS "Allow full access to roles" ON public.roles;
CREATE POLICY "Allow full access to roles" ON public.roles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to users" ON public.users;
CREATE POLICY "Allow full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to clients" ON public.clients;
CREATE POLICY "Allow full access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to brand_kits" ON public.brand_kits;
CREATE POLICY "Allow full access to brand_kits" ON public.brand_kits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to campaigns" ON public.campaigns;
CREATE POLICY "Allow full access to campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to tasks" ON public.tasks;
CREATE POLICY "Allow full access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to task_reviews" ON public.task_reviews;
CREATE POLICY "Allow full access to task_reviews" ON public.task_reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to performance_scores" ON public.performance_scores;
CREATE POLICY "Allow full access to performance_scores" ON public.performance_scores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to system_settings" ON public.system_settings;
CREATE POLICY "Allow full access to system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Initial Production Seed Data (Roles, System Settings, Initial Team & Clients)
-- ----------------------------------------------------------------------------
INSERT INTO public.roles (id, slug, name_ar, name_en, description_ar, permissions)
VALUES
  ('role-ceo', 'ceo', 'المدير العام للوكالة', 'CEO / Agency Director', 'صلاحية كاملة وإشراف على تقييم الفريق وربحية العملاء', '{"can_approve": true, "can_split_campaigns": true, "can_view_all_scores": true, "can_manage_clients": true, "can_generate_reports": true}'::jsonb),
  ('role-am', 'account_manager', 'مدير الحسابات وقائد الفريق', 'Account Manager / Team Lead', 'إدخال طلبات العملاء، تشغيل محرك تقسيم المهام بالذكاء الاصطناعي، ومراجعة التسليمات', '{"can_approve": true, "can_split_campaigns": true, "can_view_all_scores": true, "can_manage_clients": true, "can_generate_reports": true}'::jsonb),
  ('role-content', 'content_creator', 'صانع المحتوى وكاتب الإعلانات', 'Content Creator & Copywriter', 'توليد أفكار المحتوى وكتابة سكريبتات Reels والكابشنز وفق نبرة صوت العميل', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('role-designer', 'graphic_designer', 'مصمم جرافيك وفنان ذكاء اصطناعي', 'Graphic Designer & AI Visual Artist', 'تنفيذ التصميمات وتوليد برومبتس صور وفيديو 4K متوافقة مع ألوان العميل', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('role-video', 'video_editor', 'مونتير فيديو ومصمم موشن', 'Video Editor & Motion Designer', 'مونتاج الريلز والتحريك والهندسة الصوتية وفق الستوري بورد', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('role-media', 'media_buyer', 'خبير الإعلانات الممولة والأداء', 'Performance Media Buyer', 'إدارة الحملات الإعلانية وتحليل مؤشرات الصرف والعائد ROAS و CPL', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('role-mod', 'moderation', 'أخصائي إدارة المجتمعات والردود', 'Moderation Specialist', 'إدارة التعليقات والرسائل وتحويل الاستفسارات إلى مبيعات', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_settings (id, gemini_api_key_encrypted, gemini_model, kpi_weights)
VALUES (
  'global_config',
  '',
  'gemini-2.0-flash',
  '{"on_time_weight": 40, "first_time_approval_weight": 35, "speed_quality_weight": 25}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, full_name, email, avatar_url, role_id, role_slug, access_level, job_title_ar, specialty_tags, is_active)
VALUES
  ('user-ceo', 'طارق المنصور', 'tarek@launchpad-agency.ai', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'role-ceo', 'ceo', 'director', 'المدير العام للوكالة (Agency Director)', ARRAY['Agency Strategy', 'Client Retention'], true),
  ('user-am', 'سارة العتيبي', 'sara@launchpad-agency.ai', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'role-am', 'account_manager', 'team_lead', 'مديرة الحسابات وقائدة الفريق', ARRAY['Campaign Planning', 'Brief Engineering'], true),
  ('user-content', 'كريم نبيل', 'kareem@launchpad-agency.ai', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'role-content', 'content_creator', 'member', 'صانع محتوى وكاتب سكريبتات', ARRAY['Reels Scripts', 'Hooks', 'Copywriting'], true),
  ('user-designer', 'نورهان خالد', 'nourhan@launchpad-agency.ai', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'role-designer', 'graphic_designer', 'member', 'مصممة جرافيك وفنانة ذكاء اصطناعي', ARRAY['Midjourney & Flux', 'Social Grid'], true),
  ('user-video', 'عمر زيدان', 'omar@launchpad-agency.ai', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'role-video', 'video_editor', 'member', 'مونتير فيديو ومصمم موشن', ARRAY['Reels Editing', 'Motion Graphics', 'SFX'], true),
  ('user-media', 'زياد الشامي', 'ziad@launchpad-agency.ai', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'role-media', 'media_buyer', 'member', 'خبير إعلانات ممولة وأداء', ARRAY['Meta & TikTok Ads', 'ROAS Scaling'], true),
  ('user-mod', 'هنا سمير', 'hana@launchpad-agency.ai', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'role-mod', 'moderation', 'member', 'أخصائية إدارة مجتمعات ومبيعات رسائل', ARRAY['DM Closing', 'Crisis Management'], true)
ON CONFLICT (id) DO NOTHING;
