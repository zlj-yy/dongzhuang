import type { Product, Ingredient, ProductIngredient } from "@/types";

// 演示数据（与 supabase/seed.sql 保持一致），仅在 Supabase 未配置时用于本地开发。
// ⚠️ 这些不是真实产品数据，仅用于开发阶段的技术验证，请勿对外展示。

const TIMESTAMP = "2026-01-01T00:00:00.000Z";

export const demoProducts: Product[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "[演示] 温和保湿洁面乳",
    brand: "[演示品牌]",
    category: "洁面",
    description: "演示数据：用于验证产品与成分关联。",
    image_url: null,
    filing_no: null,
    spec: null,
    version: null,
    source_name: null,
    source_url: null,
    verification_status: null,
    verified_at: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "[演示] 烟酰胺焕亮精华",
    brand: "[演示品牌]",
    category: "精华",
    description: "演示数据：用于验证产品与成分关联。",
    image_url: null,
    filing_no: null,
    spec: null,
    version: null,
    source_name: null,
    source_url: null,
    verification_status: null,
    verified_at: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  },
];

export const demoIngredients: Ingredient[] = [
  { id: "00000000-0000-4000-8000-000000000101", inci_name: "Aqua", chinese_name: "水", function_category: "溶剂", attention_level: 1, attention_note: null, plain_explanation: "水是化妆品里最常见的成分，主要起溶解、稀释其他成分的作用。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
  { id: "00000000-0000-4000-8000-000000000102", inci_name: "Glycerin", chinese_name: "甘油", function_category: "保湿剂", attention_level: 1, attention_note: null, plain_explanation: "甘油是常见的保湿成分，能帮助皮肤留住水分。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
  { id: "00000000-0000-4000-8000-000000000103", inci_name: "Sodium Hyaluronate", chinese_name: "透明质酸钠", function_category: "保湿剂", attention_level: 1, attention_note: null, plain_explanation: "透明质酸钠是常见的保湿成分，能吸收并锁住水分。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
  { id: "00000000-0000-4000-8000-000000000104", inci_name: "Niacinamide", chinese_name: "烟酰胺", function_category: "美白/控油", attention_level: 2, attention_note: "部分人群可能不耐受，建议从低浓度开始使用并先做局部测试。", plain_explanation: "烟酰胺是一种常见的护肤成分，常被宣称有助于提亮肤色、调节油脂。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
  { id: "00000000-0000-4000-8000-000000000105", inci_name: "Phenoxyethanol", chinese_name: "苯氧乙醇", function_category: "防腐剂", attention_level: 2, attention_note: "少数人群可能对其敏感，若出现不适请停用。", plain_explanation: "苯氧乙醇是一种常见的防腐剂，用来保持产品不易变质。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
  { id: "00000000-0000-4000-8000-000000000106", inci_name: "Fragrance", chinese_name: "香精", function_category: "香精", attention_level: 3, attention_note: "易过敏或皮肤敏感的人群需留意，可能引起刺激。", plain_explanation: "香精用来让产品有香味，属于常见的致敏来源之一。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
  { id: "00000000-0000-4000-8000-000000000107", inci_name: "Cocamidopropyl Betaine", chinese_name: "椰油酰胺丙基甜菜碱", function_category: "清洁剂", attention_level: 2, attention_note: "少数人群可能对其敏感。", plain_explanation: "一种常见的温和清洁成分，常用于洁面、洗发产品。", created_at: TIMESTAMP, updated_at: TIMESTAMP },
];

export const demoProductIngredients: ProductIngredient[] = [
  // 洁面乳
  { product_id: "00000000-0000-4000-8000-000000000001", ingredient_id: "00000000-0000-4000-8000-000000000101", position: 1 },
  { product_id: "00000000-0000-4000-8000-000000000001", ingredient_id: "00000000-0000-4000-8000-000000000107", position: 2 },
  { product_id: "00000000-0000-4000-8000-000000000001", ingredient_id: "00000000-0000-4000-8000-000000000102", position: 3 },
  { product_id: "00000000-0000-4000-8000-000000000001", ingredient_id: "00000000-0000-4000-8000-000000000105", position: 4 },
  { product_id: "00000000-0000-4000-8000-000000000001", ingredient_id: "00000000-0000-4000-8000-000000000106", position: 5 },
  // 精华
  { product_id: "00000000-0000-4000-8000-000000000002", ingredient_id: "00000000-0000-4000-8000-000000000101", position: 1 },
  { product_id: "00000000-0000-4000-8000-000000000002", ingredient_id: "00000000-0000-4000-8000-000000000104", position: 2 },
  { product_id: "00000000-0000-4000-8000-000000000002", ingredient_id: "00000000-0000-4000-8000-000000000103", position: 3 },
  { product_id: "00000000-0000-4000-8000-000000000002", ingredient_id: "00000000-0000-4000-8000-000000000102", position: 4 },
  { product_id: "00000000-0000-4000-8000-000000000002", ingredient_id: "00000000-0000-4000-8000-000000000105", position: 5 },
];
