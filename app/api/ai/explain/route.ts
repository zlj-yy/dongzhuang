import { NextResponse } from "next/server";
import { getAiExplanation, AiError } from "@/lib/ai";

// 成分 id 为 UUID 格式
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// 本接口只需一个 ingredientId，10KB 上限足够
const MAX_BODY_BYTES = 10_000;

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "请求体过大" }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
    }

    const ingredientId = (body as { ingredientId?: unknown })?.ingredientId;
    if (typeof ingredientId !== "string" || !UUID_PATTERN.test(ingredientId)) {
      return NextResponse.json(
        { error: "缺少或无效的成分信息" },
        { status: 400 },
      );
    }

    // API Key 未配置：返回友好提示，不暴露任何技术细节
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "AI 通俗解释暂未开通" },
        { status: 503 },
      );
    }

    const result = await getAiExplanation(ingredientId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/ai/explain] 失败：", err);
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "AI 解释暂不可用，请稍后重试" },
      { status: 500 },
    );
  }
}
