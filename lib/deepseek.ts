import "server-only";

export const DEEPSEEK_MODEL = "deepseek-chat";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const TIMEOUT_MS = 15_000;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 调用 DeepSeek Chat Completions，返回首条消息的文本内容。
 * 只在服务端调用；DEEPSEEK_API_KEY 从环境变量读取，绝不暴露给浏览器。
 */
export async function callDeepSeekChat(
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.3,
        stream: false,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`DeepSeek 请求失败（HTTP ${response.status}）`);
    }

    const data = await response.json();
    const content: unknown = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("DeepSeek 返回内容为空");
    }
    return content;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("DeepSeek 请求超时");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
