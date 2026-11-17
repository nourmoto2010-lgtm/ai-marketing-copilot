// ============================================================================
// AI Marketing Team Copilot & Client Hub - Comprehensive Seed Data
// ============================================================================
// يضم هذا الملف:
// - 7 حسابات فريق عمل تغطي القيادة + الـ 6 أدوار الوظيفية
// - 4 عملاء متنوعين (الأغذية والحلويات، الكافيهات، الصيدليات، الصناعة والتصدير)
// - 4 خزائن هوية بصرية كاملة (Brand Kits)
// - 4 حملات تسويقية نشطة بأرقام إعلانية حقيقية
// - 16 مهمة حقيقية في مراحل مختلفة مع مخرجات جاهزة وتبعيات
// - سجل مراجعات وتقييمات أداء أسبوعية ذكية (Performance Scores)
// ============================================================================

import {
  BrandKit,
  Campaign,
  Client,
  PerformanceScore,
  Role,
  Task,
  TaskReview,
  User,
} from "@/types/database";

// ----------------------------------------------------------------------------
// 1. الأدوار الوظيفية (Roles)
// ----------------------------------------------------------------------------
export const SEED_ROLES: Role[] = [
  {
    id: "role-ceo",
    slug: "ceo",
    name_ar: "المدير العام للوكالة",
    name_en: "CEO / Agency Director",
    description_ar: "صلاحية كاملة، إشراف على تقييم الفريق، ربحية العملاء، واعتماد الحملات الكبرى.",
    permissions: {
      can_approve: true,
      can_split_campaigns: true,
      can_view_all_scores: true,
      can_manage_clients: true,
      can_generate_reports: true,
    },
    default_copilot_tools: [
      {
        id: "exec-bottleneck",
        label_ar: "تحليل اختناقات التسليم هذا الأسبوع",
        prompt_template: "حلل حالة هذه المهمة وتأثيرها على جدول تسليمات العميل وقدم توصية إدارية سريعة.",
        badge_en: "SLA Audit",
      },
      {
        id: "exec-quality",
        label_ar: "تقييم مطابقة المخرج لمعايير الوكالة",
        prompt_template: "راجع مخرجات هذه المهمة وقيم مدى التزامها بالـ Brand Kit وجودة التنفيذ من 10.",
        badge_en: "QA Check",
      },
    ],
  },
  {
    id: "role-am",
    slug: "account_manager",
    name_ar: "مدير الحسابات وقائد الفريق",
    name_en: "Account Manager / Team Lead",
    description_ar: "تحويل طلبات العملاء إلى بريف، تشغيل محرك تقسيم المهام بالـ AI، مراجعة التسليمات ومتابعة العملاء.",
    permissions: {
      can_approve: true,
      can_split_campaigns: true,
      can_view_all_scores: true,
      can_manage_clients: true,
      can_generate_reports: true,
    },
    default_copilot_tools: [
      {
        id: "am-brief",
        label_ar: "إثراء البريف ومعايير القبول",
        prompt_template: "حول بريف هذه المهمة إلى Creative Brief مفصل مع نقاط فحص واضحة (Acceptance Criteria) للفريق.",
        badge_en: "Smart Brief",
      },
      {
        id: "am-review",
        label_ar: "فحص التطابق مع Brand Kit قبل الاعتماد",
        prompt_template: "افحص مخرجات المهمة الحالية وتأكد من عدم مخالفة محظورات العميل (DON'Ts) ومن قوة الـ CTA.",
        badge_en: "Brand Guard",
      },
    ],
  },
  {
    id: "role-content",
    slug: "content_creator",
    name_ar: "صانع المحتوى وكاتب الإعلانات",
    name_en: "Content Creator & Copywriter",
    description_ar: "توليد أفكار المحتوى، كتابة سكريبتات Reels، الهوكات الخاطفة، والكابشنز المتوافقة مع نبرة صوت العميل.",
    permissions: {
      can_approve: false,
      can_split_campaigns: false,
      can_view_all_scores: false,
      can_manage_clients: false,
      can_generate_reports: false,
    },
    default_copilot_tools: [
      {
        id: "cc-hooks",
        label_ar: "اكتب 3 هوكات خاطفة لريلز هذا العميل",
        prompt_template: "اكتب لي 3 هوكات خاطفة (Scroll-Stopping Hooks) لأول 3 ثوانٍ في ريلز هذه المهمة متوافقة مع نبرة صوت العميل.",
        badge_en: "3 Viral Hooks",
      },
      {
        id: "cc-script",
        label_ar: "كتابة سكريبت Reels كامل بالثواني + كابشن",
        prompt_template: "اكتب سكريبت Reels كامل مقسم بالثواني (المشهد البصري + التعليق الصوتي) مع كابشن جاهز للنشر و CTA قوي.",
        badge_en: "Full Script & Caption",
      },
      {
        id: "cc-carousel",
        label_ar: "تقسيم الفكرة إلى شرائح Carousel تفاعلية",
        prompt_template: "قسم موضوع المهمة إلى 6 شرائح Carousel جذابة مع نص كل شريحة والكابشن المرفق.",
        badge_en: "Carousel Builder",
      },
    ],
  },
  {
    id: "role-designer",
    slug: "graphic_designer",
    name_ar: "مصمم جرافيك وفنان ذكاء اصطناعي",
    name_en: "Graphic Designer & AI Visual Artist",
    description_ar: "تنفيذ التصميمات الإعلانية وتوليد برومبتات صور وفيديو 4K احترافية متوافقة مع ألوان ومقاسات العميل.",
    permissions: {
      can_approve: false,
      can_split_campaigns: false,
      can_view_all_scores: false,
      can_manage_clients: false,
      can_generate_reports: false,
    },
    default_copilot_tools: [
      {
        id: "gd-prompt",
        label_ar: "حول البريف إلى برومبت تصميم 4K بألوان البراند",
        prompt_template: "حول بريف هذه المهمة إلى 2 برومبت احترافي باللغة الإنجليزية (Midjourney v6 / Flux 4K) متضمناً أكواد ألوان العميل Hex والإضاءة والعدسة.",
        badge_en: "4K AI Prompt",
      },
      {
        id: "gd-layout",
        label_ar: "اقتراح التوجيه الفني وتوزيع العناصر (Layout)",
        prompt_template: "اقترح التوجيه الفني (Art Direction) وتوزيع العناصر البصرية والخطوط والتباين اللوني لهذا التصميم.",
        badge_en: "Art Direction",
      },
    ],
  },
  {
    id: "role-video",
    slug: "video_editor",
    name_ar: "مونتير فيديو ومصمم موشن",
    name_en: "Video Editor & Motion Designer",
    description_ar: "تحويل السكريبتات والستوري بورد إلى ريلز وفيديوهات موشن احترافية مع هندسة صوتية وإيقاع بصري سريع.",
    permissions: {
      can_approve: false,
      can_split_campaigns: false,
      can_view_all_scores: false,
      can_manage_clients: false,
      can_generate_reports: false,
    },
    default_copilot_tools: [
      {
        id: "ve-storyboard",
        label_ar: "بناء جدول Storyboard بالثواني والمؤثرات الصوتية",
        prompt_template: "حول هذه المهمة إلى جدول ستوري بورد مقسم بالثواني يوضح اللقطات، الانتقالات (Transitions)، والمؤثرات الصوتية (SFX).",
        badge_en: "Storyboard & SFX",
      },
      {
        id: "ve-checklist",
        label_ar: "توليد قائمة فحص جودة الفيديو قبل التسليم",
        prompt_template: "أنشئ قائمة مراجعة فنية (Quality Checklist) مخصصة لهذا الريلز لضمان القبول من أول مرة بدون تعديلات.",
        badge_en: "QC Checklist",
      },
    ],
  },
  {
    id: "role-media",
    slug: "media_buyer",
    name_ar: "خبير الإعلانات الممولة والأداء",
    name_en: "Performance Media Buyer",
    description_ar: "إدارة الحملات الممولة، تحليل مؤشرات الصرف والعائد (CTR, CPL, ROAS)، وبناء خطط الاستهداف والـ Scaling.",
    permissions: {
      can_approve: false,
      can_split_campaigns: false,
      can_view_all_scores: false,
      can_manage_clients: false,
      can_generate_reports: false,
    },
    default_copilot_tools: [
      {
        id: "mb-optimize",
        label_ar: "تحليل أرقام الحملة وتوصيات رفع الـ ROAS",
        prompt_template: "حلل مؤشرات هذه الحملة الإعلانية (CTR, CPL, ROAS) وقدم 3 توصيات عملية لخفض تكلفة النتيجة وزيادة المبيعات.",
        badge_en: "ROAS Optimizer",
      },
      {
        id: "mb-targeting",
        label_ar: "بناء هيكل الاستهداف واختبارات A/B",
        prompt_template: "اقترح هيكل الحملة الإعلانية (TOF/MOF/BOF) وشرائح الاستهداف واختبارات A/B للـ Creatives لهذا العميل.",
        badge_en: "Targeting & A/B",
      },
    ],
  },
  {
    id: "role-mod",
    slug: "moderation",
    name_ar: "أخصائي إدارة المجتمعات والردود",
    name_en: "Moderation & Social Selling Specialist",
    description_ar: "إدارة تعليقات ورسائل صفحات العملاء، تحويل الاستفسارات إلى مبيعات، والرد الاحترافي وفق نبرة صوت العميل.",
    permissions: {
      can_approve: false,
      can_split_campaigns: false,
      can_view_all_scores: false,
      can_manage_clients: false,
      can_generate_reports: false,
    },
    default_copilot_tools: [
      {
        id: "mod-playbook",
        label_ar: "توليد دليل الردود الذكية وسيناريو البيع في الـ DM",
        prompt_template: "أنشئ دليل ردود جاهز (FAQ & DM Sales Script) لهذه الحملة متوافقاً مع نبرة صوت العميل ومحظوراته.",
        badge_en: "DM Sales Playbook",
      },
      {
        id: "mod-objection",
        label_ar: "صياغة ردود دبلوماسية على اعتراضات الأسعار",
        prompt_template: "اكتب 3 ردود احترافية للرد على تعليقات استغلاء السعر أو تأخر التوصيل مع تحويل العميل للرسائل الخاصة.",
        badge_en: "Objection Handler",
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// 2. أعضاء الفريق (Users - 4 Active Team Members as configured)
// ----------------------------------------------------------------------------
export const SEED_USERS: User[] = [
  {
    id: "user-ceo",
    full_name: "Nour Saleh",
    email: "nour.saleh@launchpad-agency.ai",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role_id: "role-ceo",
    role_slug: "ceo",
    access_level: "director",
    job_title_ar: "مدير التسويق والوكالة (Marketing Manager)",
    specialty_tags: ["Marketing Strategy", "Client Growth", "Executive QA"],
    is_active: true,
  },
  {
    id: "user-am",
    full_name: "Shrouk",
    email: "shrouk@launchpad-agency.ai",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role_id: "role-am",
    role_slug: "account_manager",
    access_level: "team_lead",
    job_title_ar: "قائدة الفريق ومديرة الحسابات (Team Leader)",
    specialty_tags: ["Team Leadership", "Campaign Breakdown", "Content & Scripting"],
    is_active: true,
  },
  {
    id: "user-designer",
    full_name: "Salma",
    email: "salma@launchpad-agency.ai",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role_id: "role-designer",
    role_slug: "graphic_designer",
    access_level: "member",
    job_title_ar: "مصممة جرافيك وذكاء اصطناعي (Designer & AI)",
    specialty_tags: ["Graphic Design", "AI Visuals 4K", "Reels & Motion"],
    is_active: true,
  },
  {
    id: "user-media",
    full_name: "Mohamed",
    email: "mohamed@launchpad-agency.ai",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    role_id: "role-media",
    role_slug: "media_buyer",
    access_level: "member",
    job_title_ar: "خبير الإعلانات الممولة والأداء (Media Buyer)",
    specialty_tags: ["Meta & TikTok Ads", "ROAS Scaling", "Performance Marketing"],
    is_active: true,
  },
];

// ----------------------------------------------------------------------------
// 3. العملاء الأربعة (4 Diverse Clients across required sectors)
// ----------------------------------------------------------------------------
export const SEED_CLIENTS: Client[] = [
  {
    id: "client-sweets",
    name: "شهد ومكسرات للحلويات الفاخرة",
    name_en: "Shahd & Nuts Artisanal Sweets",
    sector: "food_sweets",
    sector_label_ar: "قطاع الأغذية والحلويات",
    logo_url: "🍯",
    cover_color: "#B45309",
    account_manager_id: "user-am",
    status: "active",
    monthly_package: {
      package_name: "باقة النمو الذهبية (Full-Funnel Growth)",
      monthly_retainer_usd: 3200,
      posts_target: 16,
      posts_done: 13,
      reels_target: 10,
      reels_done: 8,
      designs_target: 24,
      designs_done: 20,
      ad_budget_usd: 4500,
      ad_spend_usd: 3650,
    },
  },
  {
    id: "client-cafe",
    name: "روستيكا كافيه للقهوة المختصة",
    name_en: "Roastica Specialty Coffee & Bakery",
    sector: "cafes",
    sector_label_ar: "قطاع الكافيهات والمقاهي",
    logo_url: "☕",
    cover_color: "#78350F",
    account_manager_id: "user-am",
    status: "active",
    monthly_package: {
      package_name: "باقة الحضور الرقمي والـ Reels",
      monthly_retainer_usd: 2400,
      posts_target: 12,
      posts_done: 10,
      reels_target: 12,
      reels_done: 9,
      designs_target: 18,
      designs_done: 15,
      ad_budget_usd: 2500,
      ad_spend_usd: 1920,
    },
  },
  {
    id: "client-pharma",
    name: "مجموعة صيدليات الشفاء بلس",
    name_en: "Al-Shifa Plus Pharmacies & Dermacare",
    sector: "pharmacies",
    sector_label_ar: "قطاع الصيدليات والرعاية الصحية",
    logo_url: "⚕️",
    cover_color: "#0D9488",
    account_manager_id: "user-am",
    status: "active",
    monthly_package: {
      package_name: "باقة الثقة الطبية والتجارة الإلكترونية",
      monthly_retainer_usd: 3800,
      posts_target: 20,
      posts_done: 15,
      reels_target: 8,
      reels_done: 6,
      designs_target: 25,
      designs_done: 19,
      ad_budget_usd: 6000,
      ad_spend_usd: 4800,
    },
  },
  {
    id: "client-export",
    name: "المتحدة للصناعات الغذائية والتصدير",
    name_en: "United AgroExport & Frozen Foods B2B",
    sector: "industry_export",
    sector_label_ar: "قطاع الصناعة والتصدير (B2B)",
    logo_url: "🚢",
    cover_color: "#1E3A8A",
    account_manager_id: "user-am",
    status: "active",
    monthly_package: {
      package_name: "باقة التوسع الدولي وتوليد العقود B2B",
      monthly_retainer_usd: 4200,
      posts_target: 12,
      posts_done: 9,
      reels_target: 6,
      reels_done: 4,
      designs_target: 16,
      designs_done: 14,
      ad_budget_usd: 8000,
      ad_spend_usd: 6100,
    },
  },
];

// ----------------------------------------------------------------------------
// 4. خزنة الهوية البصرية لكل عميل (Brand Kits & AI Memory)
// ----------------------------------------------------------------------------
export const SEED_BRAND_KITS: BrandKit[] = [
  {
    id: "bk-sweets",
    client_id: "client-sweets",
    colors: [
      { name: "ذهبي ملكي (Royal Pistachio Gold)", hex: "#D4AF37", usage: "العناوين والإطارات الفاخرة" },
      { name: "عنابي مخملي (Velvet Burgundy)", hex: "#581C24", usage: "الخلفيات الرئيسية الفخمة" },
      { name: "أخضر فستقي (Antep Pistachio)", hex: "#65A30D", usage: "عناصر التمييز وأزرار الـ CTA" },
      { name: "كريمي دافئ (Warm Cream)", hex: "#FFFBEB", usage: "النصوص والخلفيات الفاتحة" },
    ],
    fonts: {
      heading: "Cairo Bold",
      body: "Cairo Regular",
      english: "Inter SemiBold",
    },
    tone_of_voice:
      "دافئة، كريمة، احتفالية، وتثير الشهية (Sensory & Appetizing). نستخدم عبارات تبرز الأصالة، السمن البلدي الطبيعي 100%، والفستق الحلبي الفاخر كهدية تشرف في العزومات والمناسبات.",
    target_audience:
      "العائلات، محبو الحلويات الشرقية الفاخرة، الباحثون عن بوكسات هدايا راقية للمناسبات والزيارات العائلية والشركات (الفئة العمرية 25 - 55).",
    usp_and_key_messages:
      "تُخبز يومياً بالسمن البلدي الصافي ومكسرات الدرجة الأولى بدون أي مواد حافظة، مع توصيل مبرد يحافظ على القرمشة والطراوة خلال 60 دقيقة.",
    dos_and_donts: {
      dos: [
        "التركيز على اللقطات القريبة جداً (Macro Shots) لتساقط الشربات والفستق وقرمشة البقلاوة",
        "إبراز فخامة التغليف (Luxury Gift Packaging) المناسب للهدايا",
        "ذكر ضمان الطزاجة اليومية والتوصيل السريع",
      ],
      donts: [
        "ممنوع استخدام كلمات مثل 'رخيص' أو 'شعبي'؛ نستخدم 'قيمة استثنائية' أو 'عرض الضيافة'",
        "ممنوع استخدام خلفيات باردة أو ألوان نيون فاقعة",
        "عدم المبالغة في السكر بالصور بشكل يبدو صناعياً",
      ],
    },
    social_links: {
      instagram: "https://instagram.com/shahdandnuts",
      tiktok: "https://tiktok.com/@shahdandnuts",
      facebook: "https://facebook.com/shahdandnuts",
      website: "https://shahdandnuts.com",
    },
    visual_style_prompt_prefix:
      "Commercial macro food photography, luxury Middle Eastern artisanal baklava and pistachio sweets, warm golden hour rim lighting, deep burgundy velvet and brushed gold props, shallow depth of field, 85mm lens, 8k photorealistic",
  },
  {
    id: "bk-cafe",
    client_id: "client-cafe",
    colors: [
      { name: "بني إسبريسو عميق (Dark Roast)", hex: "#291811", usage: "الخلفيات الداكنة والنصوص" },
      { name: "بيج لاتيه دافئ (Oat Latte Beige)", hex: "#E7D8C9", usage: "الخلفيات المينيمال الهادئة" },
      { name: "برتقالي تيراكوتا (Terracotta Roast)", hex: "#C2410C", usage: "أزرار التفاعل والـ Badges" },
      { name: "أخضر ماتشا (Matcha Sage)", hex: "#84A98C", usage: "مشروبات الماتشا والمنتجات الموسمية" },
    ],
    fonts: {
      heading: "Cairo ExtraBold",
      body: "Cairo Medium",
      english: "Inter Bold",
    },
    tone_of_voice:
      "شبابية، ملهمة، عصرية، وودودة (Cozy, Trendy & Artisanal). نتحدث كصديق يفهم شغف القهوة المختصة (V60, Flat White, Cold Brew) ويوفر مساحة عمل وهدوء مثالية.",
    target_audience:
      "الشباب، المستقلون (Freelancers)، رواد الأعمال، طلاب الجامعات، وعشاق القهوة المختصة والمخبوزات الطازجة (الفئة العمرية 18 - 38).",
    usp_and_key_messages:
      "حبوب قهوة مختصة (Single Origin) محمصة محلياً كل أسبوع، مع كرواسون فرنسي يخبز طازجاً كل صباح الساعة 7:00، وإنترنت فائق السرعة لبيئة عمل ملهمة.",
    dos_and_donts: {
      dos: [
        "استخدام أصوات حقيقية لتحضير القهوة (ASMR Coffee Brewing: طحن البن، صب الإسبريسو، قرمشة الكرواسون)",
        "إظهار أجواء المكان الدافئة والإضاءة الطبيعية على الطاولات الخشبية",
        "دمج المصطلحات الإنجليزية اللطيفة (Morning Ritual, Specialty Dose, Freshly Baked)",
      ],
      donts: [
        "تجنب الأسلوب الرسمي الجاف أو الإعلانات الصاخبة المزعجة",
        "عدم استخدام صور ستوك (Stock Photos) جاهزة؛ يجب أن تبدو اللقطات عفوية وحقيقية (UGC Style)",
      ],
    },
    social_links: {
      instagram: "https://instagram.com/roasticacoffee",
      tiktok: "https://tiktok.com/@roasticacoffee",
      website: "https://roastica.cafe",
    },
    visual_style_prompt_prefix:
      "Aesthetic specialty coffee shop photography, minimalist warm wood and terracotta interior, natural morning sunlight casting soft shadows, creamy latte art and flaky French croissant, Kinfolk magazine editorial style, 35mm film grain, 4k",
  },
  {
    id: "bk-pharma",
    client_id: "client-pharma",
    colors: [
      { name: "أخضر زمردي طبي (Medical Teal)", hex: "#0D9488", usage: "اللون الأساسي الموثوق" },
      { name: "كحلي علمي (Clinical Navy)", hex: "#0F172A", usage: "العناوين والمعلومات الطبية" },
      { name: "أزرق نقي (Clean Aqua)", hex: "#E0F2FE", usage: "خلفيات نصائح العناية بالبشرة" },
      { name: "وردي ديرما ناعم (Dermacare Rose)", hex: "#FDA4AF", usage: "قسم التجميل والعناية بالبشرة" },
    ],
    fonts: {
      heading: "Cairo Bold",
      body: "Cairo Regular",
      english: "Inter Medium",
    },
    tone_of_voice:
      "علمية مبسطة، مطمئنة، موثوقة، وإنسانية (Empathetic, Credible & Educational). نقدم المعلومة الصيدلانية الموثقة بدون تعقيد، مع التأكيد على الاستشارة المجانية مع الصيدلي.",
    target_audience:
      "الأمهات، المهتمات بالعناية الصحية بالبشرة والشعر (Dermacare)، كبار السن وأصحاب الأمراض المزمنة الذين يحتاجون توصيل الأدوية بانتظام.",
    usp_and_key_messages:
      "توصيل الأدوية ومنتجات العناية على مدار 24 ساعة في أقل من 45 دقيقة، منتجات أصلية ومضمونة 100%، واستشارة صيدلانية فورية عبر التطبيق أو الواتساب.",
    dos_and_donts: {
      dos: [
        "إضافة تنبيه 'استشر الصيدلي أو الطبيب المختص' في المحتوى العلاجي",
        "توضيح المواد الفعالة (مثل Niacinamide, Hyaluronic Acid, Vitamin C) وفوائدها العلمية",
        "إبراز خدمة التوصيل السريع 24/7 ومسح الروشتة عبر التطبيق",
      ],
      donts: [
        "ممنوع منعاً باتاً تقديم وعود طبية قاطعة مثل 'يعالج نهائياً في يومين' أو 'نتيجة سحرية 100%'",
        "ممنوع تشخيص الأمراض في التعليقات العامة؛ يجب تحويل الحالات الطبية للاستشارة الخاصة",
        "ممنوع استخدام صور تثير القلق أو الخوف المرضي",
      ],
    },
    social_links: {
      instagram: "https://instagram.com/alshifaplus",
      facebook: "https://facebook.com/alshifaplus",
      website: "https://alshifaplus.med",
    },
    visual_style_prompt_prefix:
      "Clean clinical and dermacare studio photography, bright minimalist white and medical teal aesthetic, water droplets, hyaluronic serum glass dropper bottle, soft diffused studio lighting, high trust healthcare branding, 8k",
  },
  {
    id: "bk-export",
    client_id: "client-export",
    colors: [
      { name: "أزرق محيطي دولي (Global Logistics Blue)", hex: "#1E3A8A", usage: "الهوية المؤسسية والـ B2B" },
      { name: "أخضر زراعي مستدام (Agro Emerald)", hex: "#15803D", usage: "إبراز الطزاجة والمنشأ الطبيعي" },
      { name: "ذهبي شهادات الجودة (ISO Gold)", hex: "#CA8A04", usage: "الأختام والأرقام التصديرية" },
      { name: "رمادي فولاذي (Industrial Slate)", hex: "#F1F5F9", usage: "خلفيات الجداول والبيانات التقنية" },
    ],
    fonts: {
      heading: "Cairo Bold",
      body: "Cairo Regular",
      english: "Inter Bold",
    },
    tone_of_voice:
      "احترافية، رسمية، موثوقة، وترتكز على الأرقام والمعايير الدولية (Authoritative, Data-Driven B2B). نخاطب مديري المشتريات والمستوردين بلغة الجودة وسلاسل الإمداد.",
    target_audience:
      "مديرو المشتريات في سلاسل السوبرماركت الكبرى، مستوردو الأغذية وموزعو الـ HORECA في أوروبا، الخليج العربي، وشرق آسيا (B2B Decision Makers).",
    usp_and_key_messages:
      "تقنية التجميد الفردي السريع (IQF) خلال 3 ساعات من الحصاد، حاصلون على شهادات BRCGS, ISO 22000, GlobalG.A.P، وقدرة تصديرية تتجاوز 40,000 طن سنوياً لـ 32 دولة.",
    dos_and_donts: {
      dos: [
        "إبراز شهادات الجودة الدولية (BRC, ISO 22000, Halal, FDA) وأرقام الطاقة الإنتاجية",
        "توضيح دقة الفرز البصري بالليزر، التغليف الصناعي (Bulk & Private Label)، والالتزام بمواعيد الشحن البحري",
        "استخدام مصطلحات التصدير الاحترافية (IQF Technology, Cold Chain Integrity, FOB/CIF, Private Label)",
      ],
      donts: [
        "ممنوع استخدام لغة البيع الفردي للجمهور العادي (B2C) أو الإيموجيز المفرطة",
        "تجنب الصور غير الواضحة للمصنع؛ يجب إظهار التعقيم الكامل وخطوط الإنتاج الحديثة",
      ],
    },
    social_links: {
      linkedin: "https://linkedin.com/company/united-agroexport",
      website: "https://united-agroexport.com",
      facebook: "https://facebook.com/unitedagroexport",
    },
    visual_style_prompt_prefix:
      "Corporate industrial B2B photography, modern stainless steel IQF frozen food processing plant and international cargo container port, vibrant flash-frozen strawberries and green beans, clean blue and emerald lighting, 8k ultra sharp",
  },
];

// ----------------------------------------------------------------------------
// 5. الحملات التسويقية (Campaigns)
// ----------------------------------------------------------------------------
export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-sweets-winter",
    client_id: "client-sweets",
    title: "حملة بوكسات دفء الشتاء والجمعات العائلية",
    objective: "Sales & Online Orders (ROAS Target > 5.0x)",
    brief:
      "إطلاق بوكس 'دفء الشتاء الملكي' المكون من بقلاوة بالفستق الحلبي وكنافة نابلسية ساخنة ومكسرات مدخنة مع توصيل خلال 60 دقيقة.",
    start_date: "2026-11-01",
    end_date: "2026-11-30",
    status: "active",
    ad_metrics: {
      budget_usd: 4500,
      spend_usd: 3650,
      roas: 5.8,
      ctr: 3.4,
      cpl_usd: 2.1,
      conversions: 940,
      impressions: 420000,
    },
  },
  {
    id: "camp-cafe-morning",
    client_id: "client-cafe",
    title: "حملة طقوس الصباح: قهوة مختصة + كرواسون طازج",
    objective: "Foot Traffic & Morning Combo Subscriptions",
    brief:
      "استهداف رواد الأعمال والشباب في الفترة الصباحية (7 إلى 11 صباحاً) بعرض الكومبو الصباحي (V60 أو Flat White + كرواسون الزبدة الفرنسي) وإبراز أجواء العمل الملهمة في الكافيه.",
    start_date: "2026-11-05",
    end_date: "2026-11-30",
    status: "active",
    ad_metrics: {
      budget_usd: 2500,
      spend_usd: 1920,
      roas: 4.3,
      ctr: 2.9,
      cpl_usd: 1.45,
      conversions: 610,
      impressions: 285000,
    },
  },
  {
    id: "camp-pharma-derma",
    client_id: "client-pharma",
    title: "حملة عيادة الشتاء للعناية بالبشرة والترطيب العميق",
    objective: "App Orders & Free Pharmacist Dermacare Consultations",
    brief:
      "حملة توعوية وبيعية لروتين حماية البشرة من جفاف الشتاء مع جلسات استشارة مجانية عبر الواتساب وتوصيل منتجات الديرما كير الأصلية خلال 45 دقيقة.",
    start_date: "2026-11-01",
    end_date: "2026-11-30",
    status: "active",
    ad_metrics: {
      budget_usd: 6000,
      spend_usd: 4800,
      roas: 6.2,
      ctr: 3.8,
      cpl_usd: 1.9,
      conversions: 1420,
      impressions: 610000,
    },
  },
  {
    id: "camp-export-gulf",
    client_id: "client-export",
    title: "حملة التعاقدات التصديرية لموسم 2027 (الخليج وأوروبا B2B)",
    objective: "B2B Export Leads & Private Label Contracts (LinkedIn & Google)",
    brief:
      "استهداف مديري المشتريات والمستوردين الدوليين لعرض خط إنتاج الفراولة والخرشوف والخضروات المجمدة بتقنية IQF وتوقيع عقود التوريد السنوية Private Label.",
    start_date: "2026-11-01",
    end_date: "2026-12-15",
    status: "active",
    ad_metrics: {
      budget_usd: 8000,
      spend_usd: 6100,
      roas: 9.4,
      ctr: 2.1,
      cpl_usd: 18.5,
      conversions: 330,
      impressions: 195000,
    },
  },
];

// ----------------------------------------------------------------------------
// 6. المهام وجدول المحتوى (16 Realistic Tasks across statuses, roles & clients)
// ----------------------------------------------------------------------------
export const SEED_TASKS: Task[] = [
  // --- شهد ومكسرات (Sweets) ---
  {
    id: "task-1",
    campaign_id: "camp-sweets-winter",
    client_id: "client-sweets",
    assigned_to: "user-am",
    role_slug: "content_creator",
    title: "كتابة سكريبت وكابشن ريلز: صوت قرمشة البقلاوة الملكية الساخنة",
    brief:
      "كتابة سكريبت Reels يعتمد على الـ ASMR (صوت تقطيع البقلاوة وتساقط الفستق الحلبي والشربات الدافئ) مع 3 هوكات تجذب العائلات لطلب بوكس الشتاء.",
    content_type: "reel",
    platform: "Instagram & TikTok",
    status: "approved",
    priority: "high",
    dependencies: [],
    scheduled_publish_date: "2026-11-18",
    deadline: "2026-11-16T16:00:00Z",
    estimated_hours: 2.5,
    actual_hours: 2.0,
    delivered_at: "2026-11-16T14:30:00Z",
    revision_count: 0,
    deliverable_content: {
      hook_options: [
        "1. (هوك حسي): اسمع الصوت ده.. وتخيل ريحة السمن البلدي والفستق الحلبي وهي لسه طالعة من الفرن! 🍯✨",
        "2. (هوك مناسبات): رايح عزومة بالليل وعايز هدية تشرّف وتخلي الكل يسألك جايبها منين؟",
        "3. (هوك رقمي): 60 دقيقة بس تفصلك عن أطرى كنافة وأقرمش بقلاوة ملكية لحد باب بيتك!",
      ],
      script_or_caption:
        "المشهد 1 (0-3 ث): لقطة Macro قريبة جداً لسكين ذهبي يقطع البقلاوة مع صوت قرمشة واضح (ASMR).\nالمشهد 2 (3-8 ث): صب الشربات الدافئ ورش الفستق الحلبي الأخضر بالتصوير البطيء.\nالمشهد 3 (8-15 ث): إغلاق البوكس الملكي العنابي والذهبي مع ختم الضمان.\n\nالكابشن:\nلأن لمة الشتاء ما تحلاش غير بطعم الأصالة.. بوكس 'دفء الشتاء الملكي' من شهد ومكسرات مخبوز اليوم بالسمن البلدي الصافي 100% وفستق عنتاب الفاخر. اطلبه الآن ويوصلك دافئ خلال 60 دقيقة!",
    },
  },
  {
    id: "task-2",
    campaign_id: "camp-sweets-winter",
    client_id: "client-sweets",
    assigned_to: "user-designer",
    role_slug: "video_editor",
    title: "مونتاج وهندسة صوتية ASMR لريلز بوكس دفء الشتاء الملكي",
    brief:
      "تركيب اللقطات المصورة لبوكس شهد ومكسرات، تضخيم أصوات القرمشة وصب الشربات (Sound Design)، وإضافة عناوين متحركة بخط Cairo Bold باللون الذهبي #D4AF37.",
    content_type: "reel",
    platform: "Instagram & TikTok",
    status: "in_review",
    priority: "urgent",
    dependencies: ["task-1"],
    scheduled_publish_date: "2026-11-19",
    deadline: "2026-11-17T18:00:00Z",
    estimated_hours: 4.0,
    actual_hours: 3.5,
    delivered_at: "2026-11-17T12:00:00Z",
    revision_count: 0,
    deliverable_content: {
      script_or_caption:
        "تم تسليم النسخة الأولى V1 بدقة 4K 60fps مع مكساج صوتي متعدد الطبقات (Crisp Crunch + Warm Syrup Pour) وتصحيح ألوان دافئ يبرز اللون الذهبي والعنابي.",
      video_checklist: [
        { item: "توازن الصوت ومؤثرات الـ ASMR عند -6dB", done: true },
        { item: "تطبيق ألوان الهوية (#D4AF37 و #581C24) في الكابشن التفاعلي", done: true },
        { item: "مراعاة الهوامش الآمنة (Safe Zones) لواجهة Reels و TikTok", done: true },
        { item: "إضافة شاشة النهاية مع عرض التوصيل في 60 دقيقة", done: true },
      ],
    },
  },
  {
    id: "task-3",
    campaign_id: "camp-sweets-winter",
    client_id: "client-sweets",
    assigned_to: "user-designer",
    role_slug: "graphic_designer",
    title: "تصميم بوست ترويجي وتوليد خلفية AI لبوكس الضيافة الملكي",
    brief:
      "تصميم بوست 4:5 يعرض بوكس الضيافة الملكي على طاولة رخامية دافئة مع إضاءة مسائية فاخرة وأكواد ألوان الهوية (#581C24 و #D4AF37).",
    content_type: "static_post",
    platform: "Instagram & Facebook",
    status: "in_progress",
    priority: "high",
    dependencies: [],
    scheduled_publish_date: "2026-11-20",
    deadline: "2026-11-18T17:00:00Z",
    estimated_hours: 3.0,
    revision_count: 0,
    deliverable_content: {
      design_dimensions: "1080x1350 (4:5 Portrait)",
      design_prompt_en:
        "Commercial luxury food photography of an ornate burgundy velvet gift box (#581C24) with gold foil embossing (#D4AF37) filled with artisanal pistachio baklava, resting on a warm dark marble table, soft golden rim lighting, crushed green Antep pistachios scattered artfully, 85mm macro lens, photorealistic, 8k --ar 4:5 --v 6.0",
    },
  },
  {
    id: "task-4",
    campaign_id: "camp-sweets-winter",
    client_id: "client-sweets",
    assigned_to: "user-media",
    role_slug: "media_buyer",
    title: "تحسين حملة مبيعات بوكس الشتاء ورفع الـ ROAS فوق 5.5x",
    brief:
      "مراجعة أداء الحملة الإعلانية على Meta & TikTok، إيقاف الإعلانات ذات الـ CPL المرتفع، وزيادة ميزانية ريلز الـ ASMR بنسبة 30% في أوقات الذروة المسائية.",
    content_type: "ad_campaign",
    platform: "Meta & TikTok Ads",
    status: "published",
    priority: "high",
    dependencies: ["task-1"],
    scheduled_publish_date: "2026-11-15",
    deadline: "2026-11-15T15:00:00Z",
    estimated_hours: 3.0,
    actual_hours: 2.5,
    delivered_at: "2026-11-15T13:00:00Z",
    revision_count: 0,
    deliverable_content: {
      ad_recommendations: [
        "تحقيق ROAS 5.8x بعد التركيز على جمهور Lookalike 1% لمشتري آخر 60 يوماً.",
        "جدولة الإعلانات المسائية (من 5 مساءً إلى 12 منتصف الليل) خفضت الـ CPA بنسبة 22%.",
        "توصية الأسبوع القادم: اختبار إعلان Carousel يعرض مكونات البوكس بالأسعار.",
      ],
    },
  },

  // --- روستيكا كافيه (Roastica Specialty Coffee) ---
  {
    id: "task-5",
    campaign_id: "camp-cafe-morning",
    client_id: "client-cafe",
    assigned_to: "user-am",
    role_slug: "content_creator",
    title: "سكريبت ريلز: طقوس الساعة 7 الصبح في روستيكا (V60 & Croissant)",
    brief:
      "كتابة سكريبت ريلز عفوي وملهم يستهدف المستقلين ورواد الأعمال، يربط بين رائحة القهوة المختصة المطحونة طازجاً وقرمشة الكرواسون وبداية يوم عمل منتج.",
    content_type: "reel",
    platform: "Instagram & TikTok",
    status: "in_review",
    priority: "high",
    dependencies: [],
    scheduled_publish_date: "2026-11-19",
    deadline: "2026-11-17T19:00:00Z",
    estimated_hours: 2.5,
    actual_hours: 2.0,
    delivered_at: "2026-11-17T13:00:00Z",
    revision_count: 0,
    deliverable_content: {
      hook_options: [
        "1. فيه نوعين من الناس الصبح.. نوع بيصحى يشتغل، ونوع بيبدأ يومه بـ Morning Ritual صح في روستيكا ☕✨",
        "2. سر الإنتاجية مش في عدد ساعات الشغل.. السر في أول فنجان V60 متحمص مخصوص عشانك!",
        "3. الساعة 7:00 الصبح في روستيكا.. صوت قرمشة الكرواسون الفرنسي مع أول رشفة Flat White.",
      ],
      script_or_caption:
        "00:00 - 00:03: فتح باب الكافيه مع دخول أشعة شمس الصباح على الطاولات الخشبية.\n00:03 - 00:07: تقطير القهوة المختصة V60 بالبخار المتصاعد + إخراج الكرواسون الذهبي من الفرن.\n00:07 - 00:12: لقطة لشاب يفتح اللابتوب ويبتسم مع كوب اللاتيه.\n\nالكابشن:\nصباحك يبدأ من هنا ☕🥐 كومبو الصباح في روستيكا (قهوتك المختصة المفضلة + كرواسون الزبدة المخبوز طازجاً) بانتظارك يومياً من 7 صباحاً. طاولتك، هدوءك، وأسرع Wi-Fi ليوم مليان إنجاز.",
    },
  },
  {
    id: "task-6",
    campaign_id: "camp-cafe-morning",
    client_id: "client-cafe",
    assigned_to: "user-designer",
    role_slug: "graphic_designer",
    title: "تصميم Carousel: من المزرعة إلى فنجانك (رحلة حبوب قهوة روستيكا)",
    brief:
      "تصميم 5 شرائح Carousel بألوان الهوية (#291811 و #E7D8C9 و #C2410C) تشرح مصدر حبوب القهوة الإثيوبية والكولومبية ودرجة التحميص والإيحاءات.",
    content_type: "carousel",
    platform: "Instagram",
    status: "revision_requested",
    priority: "medium",
    dependencies: [],
    scheduled_publish_date: "2026-11-21",
    deadline: "2026-11-18T15:00:00Z",
    estimated_hours: 3.5,
    actual_hours: 4.0,
    delivered_at: "2026-11-16T18:00:00Z",
    revision_count: 1,
    deliverable_content: {
      design_dimensions: "1080x1350 (5 Slides Carousel)",
      design_prompt_en:
        "Minimalist editorial coffee infographic background, warm oat latte beige paper texture (#E7D8C9) with roasted espresso beans (#291811) and terracotta geometric accents (#C2410C), natural sunlight shadows, Kinfolk style, 4k",
      notes: "ملاحظة المراجع (سارة العتيبي): التصميم رائع لكن يرجى تكبير حجم الخط العربي في الشريحة الثالثة وإضافة شعار الكافيه في الزاوية العلوية.",
    },
  },
  {
    id: "task-7",
    campaign_id: "camp-cafe-morning",
    client_id: "client-cafe",
    assigned_to: "user-am",
    role_slug: "moderation",
    title: "إعداد دليل الردود التلقائية وحجز طاولات الاجتماعات الصباحية",
    brief:
      "تجهيز قالب ردود سريع ومبهج لرسائل إنستجرام وتيك توك للرد على استفسارات منيو الصباح، موقع الفرع، وحجز مساحات العمل المصغرة.",
    content_type: "moderation_plan",
    platform: "Instagram & TikTok DM",
    status: "approved",
    priority: "medium",
    dependencies: [],
    scheduled_publish_date: "2026-11-17",
    deadline: "2026-11-16T14:00:00Z",
    estimated_hours: 2.0,
    actual_hours: 1.5,
    delivered_at: "2026-11-16T12:00:00Z",
    revision_count: 0,
    deliverable_content: {
      moderation_faq: [
        {
          question: "بكام كومبو الصباح ومن الساعة كام؟",
          reply:
            "صباح الخير والقهوة المختصة ☕✨ كومبو الصباح (أي قهوة مختصة V60 / Flat White / Latte + كرواسون الزبدة الطازج) متاح يومياً من 7:00 صباحاً حتى 11:30 صباحاً بسعر 145 ج بدلاً من 190 ج. تحب نحجزلك طاولتك المفضلة النهاردة؟",
        },
        {
          question: "المكان مناسب للشغل والميتينج؟ والنت سريع؟",
          reply:
            "أكيد! جهزنا منطقة هادئة بالكامل مزودة بـ Fiber Wi-Fi فائق السرعة ومخارج كهرباء عند كل طاولة عشان يوم شغلك يكون في قمة التركيز 💻☕.",
        },
      ],
    },
  },

  // --- صيدليات الشفاء بلس (Al-Shifa Plus Pharmacies) ---
  {
    id: "task-8",
    campaign_id: "camp-pharma-derma",
    client_id: "client-pharma",
    assigned_to: "user-am",
    role_slug: "content_creator",
    title: "كتابة محتوى Carousel طبي: 4 أخطاء تسبب جفاف البشرة في الشتاء",
    brief:
      "كتابة محتوى علمي مبسط وموثوق حول أخطاء غسل الوجه بالماء الساخن وإهمال السيراميد والهيالورونيك أسيد في الشتاء، مع الالتزام التام بعدم إطلاق وعود علاجية قاطعة.",
    content_type: "carousel",
    platform: "Instagram & Facebook",
    status: "in_progress",
    priority: "urgent",
    dependencies: [],
    scheduled_publish_date: "2026-11-20",
    deadline: "2026-11-18T14:00:00Z",
    estimated_hours: 3.0,
    revision_count: 0,
    deliverable_content: {
      hook_options: [
        "1. بشرتك بتقشر وتشد أول ما الشتاء يدخل؟ 4 عادات يومية بتدمر حاجز البشرة بدون ما تحسي! ⚕️💧",
        "2. المرطب لوحده مش كفاية في الشتاء.. اعرفي الفرق العلمي بين Hyaluronic Acid و Ceramides من صيادلة الشفاء بلس.",
      ],
      script_or_caption:
        "مسودة الشرائح:\nالشريحة 1: العنوان التحذيري العلمي.\nالشريحة 2: خطأ استخدام الماء الساخن وتأثيره على دهون البشرة الطبيعية.\nالشريحة 3: وضع الهيالورونيك أسيد على بشرة جافة تماماً.\nالشريحة 4: الروتين الموصى به صيدلانياً + دعوة للاستشارة المجانية مع صيادلة الشفاء بلس (استشيري الصيدلي المختص لاختيار المناسب لنوع بشرتك).",
    },
  },
  {
    id: "task-9",
    campaign_id: "camp-pharma-derma",
    client_id: "client-pharma",
    assigned_to: "user-designer",
    role_slug: "graphic_designer",
    title: "تصميم هيرو بوست: خدمة توصيل الأدوية والديرما كير في 45 دقيقة",
    brief:
      "تصميم إعلان بصري نظيف وموثوق بألوان (#0D9488 و #E0F2FE) يبرز تطبيق صيدليات الشفاء بلس وميزة تصوير الروشتة والتوصيل على مدار 24 ساعة.",
    content_type: "static_post",
    platform: "Instagram & Meta Ads",
    status: "approved",
    priority: "high",
    dependencies: [],
    scheduled_publish_date: "2026-11-18",
    deadline: "2026-11-16T15:00:00Z",
    estimated_hours: 3.0,
    actual_hours: 2.5,
    delivered_at: "2026-11-16T13:30:00Z",
    revision_count: 0,
    deliverable_content: {
      design_dimensions: "1080x1080 (1:1 Square)",
      design_prompt_en:
        "Clean modern medical and dermacare advertising visual, smartphone displaying a sleek pharmacy delivery app in medical teal (#0D9488) and clean aqua (#E0F2FE), surrounded by authentic skincare serum bottles and first-aid essentials, bright studio lighting, trustworthy healthcare aesthetic, 8k",
    },
  },
  {
    id: "task-10",
    campaign_id: "camp-pharma-derma",
    client_id: "client-pharma",
    assigned_to: "user-am",
    role_slug: "moderation",
    title: "بروتوكول الرد الآمن على الاستفسارات الطبية وتحويلها للصيدلي المختص",
    brief:
      "بناء نماذج ردود معتمدة لفريق الموديريشن تمنع تشخيص الحالات الطبية في التعليقات العامة وتحول العميل فوراً لرابط الاستشارة المجانية مع الصيدلي.",
    content_type: "moderation_plan",
    platform: "All Platforms",
    status: "published",
    priority: "high",
    dependencies: [],
    scheduled_publish_date: "2026-11-14",
    deadline: "2026-11-14T16:00:00Z",
    estimated_hours: 2.5,
    actual_hours: 2.0,
    delivered_at: "2026-11-14T14:00:00Z",
    revision_count: 0,
    deliverable_content: {
      moderation_faq: [
        {
          question: "عندي احمرار شديد في البشرة بعد الغسول، أستخدم كريم إيه؟",
          reply:
            "ألف سلامة على حضرتك 🌿 حرصاً على سلامة بشرتك ودقة التوصية الطبية، لا نقوم بوصف علاجات في التعليقات العامة قبل معرفة تفاصيل نوع البشرة والروتين الحالي. تفضلي بالتواصل المباشر الآن عبر رسائل الصفحة أو واتساب الاستشارة المجانية مع دكتور صيدلي مختص وسيتابع معك فوراً.",
        },
      ],
    },
  },
  {
    id: "task-11",
    campaign_id: "camp-pharma-derma",
    client_id: "client-pharma",
    assigned_to: "user-designer",
    role_slug: "video_editor",
    title: "مونتاج فيديو موشن جرافيك: كيف تطلب روشتتك في 3 خطوات؟",
    brief:
      "فيديو موشن جرافيك مدته 20 ثانية يشرح خطوات تصوير الروشتة، مراجعتها من الصيدلي، والتوصيل خلال 45 دقيقة بألوان الشفاء بلس.",
    content_type: "motion_video",
    platform: "Instagram Reels & Meta Ads",
    status: "backlog",
    priority: "medium",
    dependencies: ["task-9"],
    scheduled_publish_date: "2026-11-23",
    deadline: "2026-11-21T16:00:00Z",
    estimated_hours: 5.0,
    revision_count: 0,
    deliverable_content: {},
  },

  // --- المتحدة للصناعات الغذائية والتصدير (United AgroExport B2B) ---
  {
    id: "task-12",
    campaign_id: "camp-export-gulf",
    client_id: "client-export",
    assigned_to: "user-am",
    role_slug: "content_creator",
    title: "كتابة منشور LinkedIn B2B: كيف تحافظ تقنية IQF على القيمة الغذائية لمدة 24 شهراً؟",
    brief:
      "محتوى تقني احترافي يخاطب مديري المشتريات والمستوردين في أوروبا والخليج، يستعرض خط التجميد الفردي السريع خلال 3 ساعات من الحصاد وشهادات BRCGS و ISO 22000.",
    content_type: "static_post",
    platform: "LinkedIn & Website",
    status: "approved",
    priority: "high",
    dependencies: [],
    scheduled_publish_date: "2026-11-18",
    deadline: "2026-11-16T17:00:00Z",
    estimated_hours: 3.0,
    actual_hours: 2.5,
    delivered_at: "2026-11-16T15:00:00Z",
    revision_count: 0,
    deliverable_content: {
      hook_options: [
        "1. في سلاسل الإمداد الدولية للأغذية المجمدة، 3 ساعات فقط بين الحصاد والتجميد هي الفارق بين المنتج القياسي والمنتج المطابق لمعايير الاتحاد الأوروبي.",
        "2. كيف تضمن ثبات الجودة واللون الطبيعي في شحنات الفراولة والخضروات المجمدة عبر 32 دولة؟",
      ],
      script_or_caption:
        "في 'المتحدة للصناعات الغذائية والتصدير (United AgroExport)'، ندير سلسلة تبريد متكاملة تبدأ من المزارع المتعاقدة وفق معيار GlobalG.A.P وحتى خطوط التجميد الفردي السريع (IQF) والفرز البصري بالليزر.\n\n✅ طاقة تصديرية: +40,000 طن سنوياً\n✅ اعتمادات دولية: BRCGS Grade AA | ISO 22000 | FDA | Halal\n✅ حلول تعبئة مرنة: Bulk 10kg/25kg & Retail Private Label\n\nللحصول على كتالوج مواصفات موسم 2027 وعينات الفحص المعملي، تواصلوا مع فريق التصدير عبر الرابط.",
    },
  },
  {
    id: "task-13",
    campaign_id: "camp-export-gulf",
    client_id: "client-export",
    assigned_to: "user-designer",
    role_slug: "graphic_designer",
    title: "تصميم إنفوجرافيك B2B: مواصفات التصدير وشهادات الجودة الدولية",
    brief:
      "تصميم بوست احترافي لمنصة LinkedIn بألوان الكحلي (#1E3A8A) والأخضر الزراعي (#15803D) والذهبي (#CA8A04) يوضح أرقام التصدير لـ 32 دولة وشهادات الـ ISO/BRC.",
    content_type: "static_post",
    platform: "LinkedIn",
    status: "in_review",
    priority: "high",
    dependencies: ["task-12"],
    scheduled_publish_date: "2026-11-19",
    deadline: "2026-11-17T17:00:00Z",
    estimated_hours: 3.5,
    actual_hours: 3.0,
    delivered_at: "2026-11-17T11:30:00Z",
    revision_count: 0,
    deliverable_content: {
      design_dimensions: "1200x1200 (LinkedIn High-Res Square)",
      design_prompt_en:
        "Corporate B2B food export infographic background, ultra-clean stainless steel IQF freezing tunnel and vibrant flash-frozen whole strawberries, deep global logistics blue (#1E3A8A) and agro emerald (#15803D) corporate grid layout, gold ISO certification badges (#CA8A04), 8k photorealistic",
    },
  },
  {
    id: "task-14",
    campaign_id: "camp-export-gulf",
    client_id: "client-export",
    assigned_to: "user-media",
    role_slug: "media_buyer",
    title: "إطلاق وتوجيه حملة LinkedIn Lead Gen & Google Search للمستوردين",
    brief:
      "استهداف المسميات الوظيفية (Procurement Director, Import Manager, Category Manager Frozen Foods) في السعودية، الإمارات، ألمانيا، وهولندا مع ضبط نموذج تسجيل العقود B2B.",
    content_type: "ad_campaign",
    platform: "LinkedIn & Google Ads",
    status: "in_progress",
    priority: "urgent",
    dependencies: ["task-12", "task-13"],
    scheduled_publish_date: "2026-11-20",
    deadline: "2026-11-18T18:00:00Z",
    estimated_hours: 4.0,
    revision_count: 0,
    deliverable_content: {
      ad_recommendations: [
        "تخصيص 60% من الميزانية لحملات Google Search على كلمات (IQF Frozen Strawberries Bulk Supplier, Private Label Frozen Vegetables Manufacturer).",
        "تخصيص 40% لحملات LinkedIn Lead Gen Forms الموجهة لمديري المشتريات في قطاع الـ HORECA والسوبرماركت.",
      ],
    },
  },
  {
    id: "task-15",
    campaign_id: "camp-export-gulf",
    client_id: "client-export",
    assigned_to: "user-designer",
    role_slug: "video_editor",
    title: "مونتاج الفيديو التعريفي لخط إنتاج الـ IQF والفرز بالليزر",
    brief:
      "مونتاج فيديو تعريفي (Corporate Reel 45s) باللغتين العربية والإنجليزية يعرض مراحل الاستلام، الغسيل، التجميد السريع IQF، والتعبئة داخل الحاويات المبردة.",
    content_type: "motion_video",
    platform: "LinkedIn & YouTube",
    status: "backlog",
    priority: "medium",
    dependencies: ["task-12"],
    scheduled_publish_date: "2026-11-24",
    deadline: "2026-11-22T17:00:00Z",
    estimated_hours: 5.0,
    revision_count: 0,
    deliverable_content: {},
  },
  {
    id: "task-16",
    campaign_id: "camp-sweets-winter",
    client_id: "client-sweets",
    assigned_to: "user-am",
    role_slug: "moderation",
    title: "تجهيز سيناريو البيع السريع لطلبات بوكسات الشركات والهدايا في الـ Inbox",
    brief:
      "بناء سيناريو محادثة لتحويل تعليقات السؤال عن السعر على ريلز شهد ومكسرات إلى طلبات مؤكدة مع اقتراح إضافة المكسرات المدخنة لرفع متوسط سلة الشراء (AOV).",
    content_type: "moderation_plan",
    platform: "Instagram & Facebook DM",
    status: "in_progress",
    priority: "medium",
    dependencies: ["task-1"],
    scheduled_publish_date: "2026-11-19",
    deadline: "2026-11-18T16:00:00Z",
    estimated_hours: 2.0,
    revision_count: 0,
    deliverable_content: {},
  },
];

// ----------------------------------------------------------------------------
// 7. سجل مراجعات المهام (Task Reviews)
// ----------------------------------------------------------------------------
export const SEED_REVIEWS: TaskReview[] = [
  {
    id: "rev-1",
    task_id: "task-1",
    reviewer_id: "user-am",
    decision: "approved",
    quality_rating: 9.6,
    feedback_notes:
      "هوكات ممتازة جداً وتلتزم 100% بنبرة الفخامة والشهية الخاصة بشهد ومكسرات بدون أي كلمات محظورة. تم الاعتماد من أول مرة.",
    is_first_time_approval: true,
    created_at: "2026-11-16T15:10:00Z",
  },
  {
    id: "rev-2",
    task_id: "task-4",
    reviewer_id: "user-ceo",
    decision: "approved",
    quality_rating: 9.5,
    feedback_notes:
      "إدارة ممتازة للميزانية الإعلانية وتحقيق ROAS 5.8x أعلى من مستهدف العميل (5.0x).",
    is_first_time_approval: true,
    created_at: "2026-11-15T14:00:00Z",
  },
  {
    id: "rev-3",
    task_id: "task-6",
    reviewer_id: "user-am",
    decision: "revision_requested",
    quality_rating: 8.2,
    feedback_notes:
      "التوجه البصري والألوان رائعة ومطابقة لـ Roastica، فقط نحتاج لتكبير حجم الخط العربي في الشريحة الثالثة لقراءة أسهل على الموبايل.",
    is_first_time_approval: false,
    created_at: "2026-11-16T19:00:00Z",
  },
  {
    id: "rev-4",
    task_id: "task-7",
    reviewer_id: "user-am",
    decision: "approved",
    quality_rating: 9.4,
    feedback_notes: "ردود ودودة وسريعة وتحول المستفسر مباشرة لحجز طاولة أو طلب الكومبو.",
    is_first_time_approval: true,
    created_at: "2026-11-16T13:00:00Z",
  },
  {
    id: "rev-5",
    task_id: "task-9",
    reviewer_id: "user-am",
    decision: "approved",
    quality_rating: 9.3,
    feedback_notes: "تصميم طبي نظيف جداً ويبعث على الثقة، تباين الألوان ممتاز.",
    is_first_time_approval: true,
    created_at: "2026-11-16T14:20:00Z",
  },
  {
    id: "rev-6",
    task_id: "task-10",
    reviewer_id: "user-ceo",
    decision: "approved",
    quality_rating: 9.7,
    feedback_notes:
      "التزام صارم بمحظورات قطاع الصيدليات (عدم التشخيص العام وتحويل الحالة للصيدلي المختص).",
    is_first_time_approval: true,
    created_at: "2026-11-14T15:00:00Z",
  },
  {
    id: "rev-7",
    task_id: "task-12",
    reviewer_id: "user-am",
    decision: "approved",
    quality_rating: 9.5,
    feedback_notes:
      "صياغة B2B احترافية جداً تخاطب صناع القرار في التصدير وتبرز شهادات الجودة بوضوح.",
    is_first_time_approval: true,
    created_at: "2026-11-16T16:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// 8. تقييمات الأداء الذكية الأسبوعية (Performance Scores for the 4 Team Members)
// ----------------------------------------------------------------------------
export const SEED_PERFORMANCE_SCORES: PerformanceScore[] = [
  {
    id: "perf-ceo",
    user_id: "user-ceo",
    period_label: "نوفمبر 2026 - الأسبوع 3",
    overall_score: 97,
    on_time_delivery_rate: 100,
    first_time_approval_rate: 96,
    quality_score: 98,
    speed_efficiency_score: 95,
    tasks_completed: 22,
    avg_revisions_per_task: 0.04,
    ai_strengths: [
      "قيادة استراتيجية ممتازة لخطط التسويق ونمو العملاء الأربعة.",
      "ضبط جودة المخرجات النهائية ورفع معدل القبول من أول مرة على مستوى الوكالة.",
    ],
    ai_improvements: [
      "التوسع في أتمتة تقارير الأداء الشهرية للعملاء الجدد.",
    ],
    ai_weekly_summary:
      "يقود Nour Saleh (Marketing Manager) عمليات التسويق والاستراتيجية بأداء قياسي (97/100) مع تحقيق أعلى معدلات نمو وعائد إعلاني للعملاء.",
    evaluated_at: "2026-11-17T09:00:00Z",
  },
  {
    id: "perf-am",
    user_id: "user-am",
    period_label: "نوفمبر 2026 - الأسبوع 3",
    overall_score: 95,
    on_time_delivery_rate: 98,
    first_time_approval_rate: 94,
    quality_score: 95,
    speed_efficiency_score: 94,
    tasks_completed: 18,
    avg_revisions_per_task: 0.05,
    ai_strengths: [
      "قيادة الفريق وكتابة بريفات وسكريبتات واضحة قللت معدل التعديلات العام بنسبة 35%.",
      "سرعة مراجعة التسليمات ومتابعة باقات العملاء الأربعة بدقة عالية.",
    ],
    ai_improvements: [
      "جدولة تقسيم حملات الشهر القادم قبل بدايته بـ 5 أيام عمل.",
    ],
    ai_weekly_summary:
      "تقود Shrouk (Team Leader) عمليات الفريق والمحتوى بكفاءة استثنائية (95/100)، مع ضبط ممتاز لجودة البريفات ومتابعة التسليمات.",
    evaluated_at: "2026-11-17T09:00:00Z",
  },
  {
    id: "perf-designer",
    user_id: "user-designer",
    period_label: "نوفمبر 2026 - الأسبوع 3",
    overall_score: 92,
    on_time_delivery_rate: 94,
    first_time_approval_rate: 90,
    quality_score: 93,
    speed_efficiency_score: 91,
    tasks_completed: 16,
    avg_revisions_per_task: 0.12,
    ai_strengths: [
      "مهارة فائقة في التصميم الجرافيكي وتوليد خلفيات تجارية واقعية 4K باستخدام برومبتات الـ AI المتوافقة مع أكواد Hex الخاصة بالعملاء.",
      "تنوع بصري قوي بين الفخامة الشرقية (شهد ومكسرات) والطابع الطبي النظيف (الشفاء بلس).",
    ],
    ai_improvements: [
      "مراجعة حجم التايبوجرافي العربي على شاشات الموبايل في تصميمات الـ Carousel لتفادي التعديلات البسيطة.",
    ],
    ai_weekly_summary:
      "تقدم Salma (Designer & AI) مستوى فنياً رائعاً في الدمج بين التصميم الجرافيكي وتوليد الصور بالذكاء الاصطناعي (92/100).",
    evaluated_at: "2026-11-17T09:00:00Z",
  },
  {
    id: "perf-media",
    user_id: "user-media",
    period_label: "نوفمبر 2026 - الأسبوع 3",
    overall_score: 94,
    on_time_delivery_rate: 96,
    first_time_approval_rate: 92,
    quality_score: 95,
    speed_efficiency_score: 92,
    tasks_completed: 14,
    avg_revisions_per_task: 0.08,
    ai_strengths: [
      "تحقيق ROAS 5.8x في حملة الحلويات و 9.4x في حملة عقود التصدير B2B.",
      "خفض تكلفة الليد (CPL) بنسبة 22% عبر جدولة أوقات الذروة وإعادة الاستهداف.",
    ],
    ai_improvements: [
      "مشاركة تقارير أداء الـ Creatives الفائزة مبكراً مع Salma لتكرار الزوايا البصرية الرابحة.",
    ],
    ai_weekly_summary:
      "أداء ممتاز من Mohamed (Media Buyer) بنتيجة (94/100)؛ نجح في تجاوز مستهدفات العائد على الصرف الإعلاني لجميع العملاء الأربعة.",
    evaluated_at: "2026-11-17T09:00:00Z",
  },
];
