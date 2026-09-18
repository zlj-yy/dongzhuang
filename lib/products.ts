import "server-only";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { Product, Ingredient } from "@/types";
import { demoProducts, demoIngredients, demoProductIngredients } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** 搜索关键词最大长度（超过则视为异常输入） */
export const MAX_QUERY_LENGTH = 50;

/** 成分及其在产品成分表中的位置 */
export type IngredientWithPosition = Ingredient & { position: number };

export interface ProductDetail {
  product: Product;
  ingredients: IngredientWithPosition[];
}

/** 转义 LIKE 通配符，避免用户输入 % _ \ 影响匹配 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * 按产品名称 / 品牌做子串搜索（ilike，大小写不敏感）。
 * Supabase 已配置时走数据库查询；未配置时回退到本地演示数据做等价匹配。
 */
export async function searchProducts(rawQuery: string): Promise<Product[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const pattern = `%${escapeLike(query)}%`;
    // 注：若关键词含逗号等 PostgREST 过滤语法特殊字符，.or() 存在边界情况；
    // MVP 阶段产品名/品牌含逗号极少，暂不处理。
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
      .order("name")
      .limit(50);

    if (error) {
      console.error("[searchProducts] Supabase 查询失败：", error.message);
      throw new Error("搜索失败，请稍后重试");
    }
    return (data as Product[]) ?? [];
  }

  // Supabase 未配置：用本地演示数据做等价子串匹配（中文不受大小写影响）
  const lower = query.toLowerCase();
  return demoProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower),
  );
}

/**
 * 按 id 获取产品及其成分列表（按 position 升序）。
 * 产品不存在返回 null；用 React cache 去重，避免 generateMetadata 与页面重复查询。
 */
export const getProductById = cache(
  async (id: string): Promise<ProductDetail | null> => {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (productError) {
        console.error("[getProductById] 读取产品失败：", productError.message);
        throw new Error("读取产品失败，请稍后重试");
      }
      if (!product) return null;

      const { data: relations, error: relationError } = await supabase
        .from("product_ingredients")
        .select("position, ingredients(*)")
        .eq("product_id", id)
        .order("position", { ascending: true });

      if (relationError) {
        console.error(
          "[getProductById] 读取成分关联失败：",
          relationError.message,
        );
        throw new Error("读取产品成分失败，请稍后重试");
      }

      // 注：PostgREST 对「多对一」关联（ingredients(*)）返回单个对象；
      // supabase-js 未传 Database 泛型时推断为数组，这里按运行时对象形态断言并解构。
      const ingredients: IngredientWithPosition[] = (relations ?? []).map(
        (row) => ({
          ...(row.ingredients as unknown as Ingredient),
          position: row.position,
        }),
      );

      return { product: product as Product, ingredients };
    }

    // Supabase 未配置：回退到本地演示数据
    const product = demoProducts.find((p) => p.id === id);
    if (!product) return null;

    const ingredients: IngredientWithPosition[] = demoProductIngredients
      .filter((rel) => rel.product_id === id)
      .sort((a, b) => a.position - b.position)
      .flatMap((rel) => {
        const ingredient = demoIngredients.find((i) => i.id === rel.ingredient_id);
        return ingredient ? [{ ...ingredient, position: rel.position }] : [];
      });

    return { product, ingredients };
  },
);
