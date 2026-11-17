-- ============================================================================
-- AI Marketing Team Copilot & Client Hub - SQL Seed Data
-- Matches src/lib/seed-data.ts (7 Users / 6 Operational Roles, 4 Clients, 4 Brand Kits)
-- ============================================================================

INSERT INTO public.roles (slug, name_ar, name_en, description_ar, permissions)
VALUES
  ('ceo', 'المدير العام للوكالة', 'CEO / Agency Director', 'صلاحية كاملة وإشراف على تقييم الفريق وربحية العملاء', '{"can_approve": true, "can_split_campaigns": true, "can_view_all_scores": true, "can_manage_clients": true, "can_generate_reports": true}'::jsonb),
  ('account_manager', 'مدير الحسابات وقائد الفريق', 'Account Manager / Team Lead', 'إدخال طلبات العملاء، تشغيل محرك تقسيم المهام بالذكاء الاصطناعي، ومراجعة التسليمات', '{"can_approve": true, "can_split_campaigns": true, "can_view_all_scores": true, "can_manage_clients": true, "can_generate_reports": true}'::jsonb),
  ('content_creator', 'صانع المحتوى وكاتب الإعلانات', 'Content Creator & Copywriter', 'توليد أفكار المحتوى وكتابة سكريبتات Reels والكابشنز وفق نبرة صوت العميل', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('graphic_designer', 'مصمم جرافيك وفنان ذكاء اصطناعي', 'Graphic Designer & AI Visual Artist', 'تنفيذ التصميمات وتوليد برومبتس صور وفيديو 4K متوافقة مع ألوان العميل', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('video_editor', 'مونتير فيديو ومصمم موشن', 'Video Editor & Motion Designer', 'مونتاج الريلز والتحريك والهندسة الصوتية وفق الستوري بورد', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('media_buyer', 'خبير الإعلانات الممولة والأداء', 'Performance Media Buyer', 'إدارة الحملات الإعلانية وتحليل مؤشرات الصرف والعائد ROAS و CPL', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb),
  ('moderation', 'أخصائي إدارة المجتمعات والردود', 'Moderation Specialist', 'إدارة التعليقات والرسائل وتحويل الاستفسارات إلى مبيعات', '{"can_approve": false, "can_split_campaigns": false, "can_view_all_scores": false, "can_manage_clients": false, "can_generate_reports": false}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ملاحظة: التطبيق يقرأ أيضاً من المزود الهجين (Supabase + src/lib/seed-data.ts) لضمان تجربة فورية غنية.
