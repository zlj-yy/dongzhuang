import "server-only";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Ingredient } from "@/types";
import { demoIngredients } from "@/lib/demo-data";

/**
 * 按 id 获取成分词条；不存在返回 null。
 * Supabase 已配置时走数据库查询；未配置时回退到本地演示数据。
 */
export const getIngredientById = cache(
  async (id: string): Promise<Ingredient | null> => {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("[getIngredientById] 读取成分失败：", error.message);
        throw new Error("读取成分失败，请稍后重试");
      }
      return (data as Ingredient) ?? null;
    }

    return demoIngredients.find((i) => i.id === id) ?? null;
  },
);
