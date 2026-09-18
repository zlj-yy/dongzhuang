-- =============================================================
-- 懂妆 · 数据库 Schema（MVP）
-- 4 张核心表：products / ingredients / product_ingredients / ai_explanations
--
-- ⚠️ 重要说明（关于「关注提示」字段）：
-- ingredients.attention_level 与 ingredients.attention_note 是「懂妆」
-- 为了方便化妆品小白阅读而做的信息整理（1=常见成分，2=需留意，3=使用注意），
-- 属于中性表述，不代表任何官方安全评级或权威结论，也不应被当作医疗/安全建议。
--
-- 唯一约束（用于导入脚本幂等去重，可重复执行）：
--   products(brand, name) 唯一；ingredients(inci_name) 唯一。
-- =============================================================

-- gen_random_uuid() 在 PostgreSQL 13+ 已内置，此处保留扩展创建以兼容旧版本
create extension if not exists "pgcrypto";

-- ---------- 产品 ----------
create table products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  brand               text not null,
  category            text not null,
  description         text,
  image_url           text,
  filing_no           text,
  spec                text,
  version             text,
  source_name         text,
  source_url          text,
  verification_status text,
  verified_at         date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (brand, name)
);

comment on table  products is '化妆品产品';
comment on column products.name                is '产品名称';
comment on column products.brand               is '品牌';
comment on column products.category            is '品类（洁面/精华/面霜/防晒等）';
comment on column products.filing_no           is '中国大陆化妆品备案号（如 云G妆网备字2023002054）';
comment on column products.spec                is '规格（如 50g / 40ml）';
comment on column products.version             is '版本/代际（如 第二代、2.0）';
comment on column products.source_name         is '成分数据来源（如 第三方公开商品/成分资料交叉验证）';
comment on column products.source_url          is '真实来源页面 URL';
comment on column products.verification_status is '核验状态/可信等级（如 A级候选，备案原文未直接核验）';
comment on column products.verified_at         is '核对日期';

-- ---------- 成分 ----------
create table ingredients (
  id                uuid primary key default gen_random_uuid(),
  inci_name         text not null,
  chinese_name      text,
  function_category text,
  attention_level   smallint check (attention_level is null or attention_level between 1 and 3),
  attention_note    text,
  plain_explanation text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (inci_name)
);

comment on table  ingredients is '化妆品成分词条';
comment on column ingredients.inci_name         is '标准 INCI 英文名';
comment on column ingredients.chinese_name      is '中文名';
comment on column ingredients.function_category is '功效/作用分类（保湿、清洁、防腐、香精等）';
comment on column ingredients.attention_level   is '关注提示等级：1=常见成分，2=需留意，3=使用注意；NULL=未核验/未知。此为「懂妆」自行整理的信息，不代表官方安全评级。';
comment on column ingredients.attention_note    is '使用注意/关注提示（中性表述，如敏感肌需留意），非官方安全结论';
comment on column ingredients.plain_explanation is '基础通俗解释（人工/预置，非 AI 生成）';

-- ---------- 产品-成分关联（多对多） ----------
create table product_ingredients (
  product_id    uuid not null references products(id)   on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  position      int  not null,
  primary key (product_id, ingredient_id)
);

comment on table  product_ingredients is '产品与成分的多对多关联';
comment on column product_ingredients.position is '成分在成分表中的排序（1 起，越小越靠前 = 含量越高；1% 以下顺序可不强制）';

-- ---------- AI 解释缓存 ----------
create table ai_explanations (
  id            uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  content       jsonb not null,
  model         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (ingredient_id)
);

comment on table  ai_explanations is 'AI 成分解释缓存（每个成分只保留最新一条）';
comment on column ai_explanations.content is 'AI 返回的结构化解释 JSON';

-- ---------- 行级安全（RLS）----------
-- 开启 RLS：默认拒绝 anon/authenticated 角色的行读取。
-- 本 MVP 只通过服务端 service_role 访问数据，因此不创建任何 anon/public policy，
-- 也不授予 anon 公开读取权限（service_role 默认绕过 RLS）。
alter table products          enable row level security;
alter table ingredients       enable row level security;
alter table product_ingredients enable row level security;
alter table ai_explanations   enable row level security;

-- ---------- 索引 ----------
-- 按品牌 / 品类浏览产品
create index idx_products_brand    on products (brand);
create index idx_products_category on products (category);

-- 按名称查找成分
create index idx_ingredients_inci_name     on ingredients (inci_name);
create index idx_ingredients_chinese_name  on ingredients (chinese_name);

-- 关联表：主键 (product_id, ingredient_id) 已覆盖按 product_id 查询，这里补按 ingredient_id 反查
create index idx_product_ingredients_ingredient on product_ingredients (ingredient_id);

-- ---------- updated_at 自动更新触发器 ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

create trigger trg_ingredients_set_updated_at
  before update on ingredients
  for each row execute function set_updated_at();

create trigger trg_ai_explanations_set_updated_at
  before update on ai_explanations
  for each row execute function set_updated_at();
