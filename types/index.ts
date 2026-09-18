// 懂妆 · 数据库行类型（与 supabase/schema.sql 保持一致）
// 后续接入 Supabase CLI 后，可用 `supabase gen types typescript` 生成并替换本文件。

/**
 * 关注提示等级（「懂妆」自行整理的信息，不代表官方安全评级）
 * 1 = 常见成分，2 = 需留意，3 = 使用注意；null = 资料不足/未核验
 */
export type AttentionLevel = 1 | 2 | 3;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  image_url: string | null;
  /** 中国大陆化妆品备案号（如 云G妆网备字2023002054） */
  filing_no: string | null;
  /** 规格（如 50g / 40ml） */
  spec: string | null;
  /** 版本/代际（如 第二代、2.0） */
  version: string | null;
  /** 成分数据来源说明 */
  source_name: string | null;
  /** 真实来源页面 URL */
  source_url: string | null;
  /** 核验状态/可信等级（如 A级候选），非官方认证 */
  verification_status: string | null;
  /** 核对日期 */
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  inci_name: string;
  chinese_name: string | null;
  function_category: string | null;
  attention_level: AttentionLevel | null;
  attention_note: string | null;
  plain_explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductIngredient {
  product_id: string;
  ingredient_id: string;
  position: number;
}

/** AI 解释的结构化输出（阶段 5 使用，与 ai_explanations.content 的 jsonb 形状对应） */
export interface AiExplanationContent {
  what_it_is: string;
  what_it_does: string;
  things_to_note: string;
  simple_summary: string;
}

export interface AiExplanation {
  id: string;
  ingredient_id: string;
  content: AiExplanationContent;
  model: string | null;
  created_at: string;
  updated_at: string;
}
