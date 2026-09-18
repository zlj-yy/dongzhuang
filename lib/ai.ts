import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIngredientById } from "@/lib/ingredients";
import { callDeepSeekChat, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import type { AiExplanationContent } from "@/types";

export class AiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export interface AiExplanationResult {
  content: AiExplanationContent;
  cached: boolean;
}

// Supabase 未配置时的内存缓存兜底（进程内有效，避免同一成分重复调用）
const memoryCache = new Map<string, AiExplanationContent>();

/**
 * 获取某个成分的 AI 通俗解释。
 * 流程：查缓存 → 命中直接返回 → 未命中调 DeepSeek → 校验 JSON → 写缓存 → 返回。
 */
export async function getAiExplanation(
  ingredientId: string,
): Promise<AiExplanationResult> {
  const ingredient = await getIngredientById(ingredientId);
  if (!ingredient) {
    throw new AiError("没有找到这个成分", 404);
  }

  const cached = await readCache(ingredientId);
  if (cached) {
    return { content: cached, cached: true };
  }

  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    { role: "user" as const, content: buildUserPrompt(ingredient) },
  ];
  const raw = await callDeepSeekChat(messages);
  const content = parseExplanation(raw);

  await writeCache(ingredientId, content);

  return { content, cached: false };
}

/** 解析并校验 DeepSeek 返回的 JSON，缺少必要字段或非字符串时报错。 */
export function parseExplanation(raw: string): AiExplanationContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiError("AI 返回内容无法解析", 502);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new AiError("AI 返回格式不正确", 502);
  }

  const obj = parsed as Record<string, unknown>;
  return {
    what_it_is: requireField(obj, "what_it_is"),
    what_it_does: requireField(obj, "what_it_does"),
    things_to_note: requireField(obj, "things_to_note"),
    simple_summary: requireField(obj, "simple_summary"),
  };
}

function requireField(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  throw new AiError("AI 返回内容不完整", 502);
}

async function readCache(
  ingredientId: string,
): Promise<AiExplanationContent | null> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("ai_explanations")
      .select("content")
      .eq("ingredient_id", ingredientId)
      .maybeSingle();
    if (error) {
      // 缓存读取失败不阻断主流程，降级为直接调用
      console.error("[ai] 读取缓存失败：", error.message);
      return null;
    }
    return (data?.content as AiExplanationContent) ?? null;
  }
  return memoryCache.get(ingredientId) ?? null;
}

async function writeCache(
  ingredientId: string,
  content: AiExplanationContent,
): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("ai_explanations")
      .upsert(
        { ingredient_id: ingredientId, content, model: DEEPSEEK_MODEL },
        { onConflict: "ingredient_id" },
      );
    if (error) {
      // 写入失败不阻断返回
      console.error("[ai] 写入缓存失败：", error.message);
    }
    return;
  }
  memoryCache.set(ingredientId, content);
}
