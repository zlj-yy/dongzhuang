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

/** 合并两批产品：按 id 去重（保留首次出现），再按名称排序 */
function mergeAndSortProducts(a: Product[], b: Product[]): Product[] {
  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const p of [...a, ...b]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    merged.push(p);
  }
  merged.sort((x, y) => x.name.localeCompare(y.name, "zh-CN"));
  return merged;
}

/**
 * 按产品名称 / 品牌 / 成分（中文名或 INCI 名）做子串搜索（ilike，大小写不敏感）。
 * 成分命中时返回「包含该成分」的产品；结果统一去重并按产品名排序。
 * Supabase 已配置时走数据库查询；未配置时回退到本地演示数据做等价匹配。
 */
export async function searchProducts(rawQuery: string): Promise<Product[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const pattern = `%${escapeLike(query)}%`;
    // 注：若关键词含逗号等 PostgREST 过滤语法特殊字符，.or() 存在边界情况；
    // MVP 阶段产品名/品牌/成分含逗号极少，暂不处理。

    // 1) 产品名 / 品牌命中
    const { data: byName, error: nameError } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.${pattern},brand.ilike.${pattern}`)
      .order("name")
      .limit(50);

    if (nameError) {
      console.error("[searchProducts] 产品查询失败：", nameError.message);
      throw new Error("搜索失败，请稍后重试");
    }

    // 2) 成分命中（chinese_name 或 inci_name）
    const { data: matchedIngredients, error: ingredientError } = await supabase
      .from("ingredients")
      .select("id")
      .or(`chinese_name.ilike.${pattern},inci_name.ilike.${pattern}`);

    if (ingredientError) {
      console.error("[searchProducts] 成分查询失败：", ingredientError.message);
      throw new Error("搜索失败，请稍后重试");
    }

    // 3) 反查包含命中成分的产品
    let byIngredient: Product[] = [];
    const ingredientIds = (matchedIngredients ?? []).map(
      (row) => row.id as string,
    );
    if (ingredientIds.length > 0) {
      const { data: relations, error: relationError } = await supabase
        .from("product_ingredients")
        .select("products(*)")
        .in("ingredient_id", ingredientIds);

      if (relationError) {
        console.error("[searchProducts] 成分关联查询失败：", relationError.message);
        throw new Error("搜索失败，请稍后重试");
      }

      // 多对一关联 products(*) 返回单个对象，这里按运行时对象形态断言
      byIngredient = (relations ?? []).flatMap((row) =>
        row.products ? [row.products as unknown as Product] : [],
      );
    }

    return mergeAndSortProducts((byName as Product[]) ?? [], byIngredient).slice(
      0,
      50,
    );
  }

  // Supabase 未配置：用本地演示数据做等价子串匹配（中文不受大小写影响）
  const lower = query.toLowerCase();

  const byName = demoProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower),
  );

  const matchingIngredientIds = new Set(
    demoIngredients
      .filter(
        (i) =>
          i.inci_name.toLowerCase().includes(lower) ||
          (i.chinese_name ?? "").toLowerCase().includes(lower),
      )
      .map((i) => i.id),
  );

  const byIngredient =
    matchingIngredientIds.size > 0
      ? demoProducts.filter((p) =>
          demoProductIngredients.some(
            (rel) =>
              rel.product_id === p.id &&
              matchingIngredientIds.has(rel.ingredient_id),
          ),
        )
      : [];

  return mergeAndSortProducts(byName, byIngredient);
}

/**
 * 首页「开始探索」用：按名称返回少量产品（只读，不写入任何数据）。
 * Supabase 已配置时查询数据库；否则回退到本地演示数据。
 * 查询失败返回空数组（由调用方决定是否隐藏该区块）。
 */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name")
      .limit(limit);

    if (error) {
      console.error("[getFeaturedProducts] Supabase 查询失败：", error.message);
      return [];
    }
    return (data as Product[]) ?? [];
  }

  return demoProducts.slice(0, limit);
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
