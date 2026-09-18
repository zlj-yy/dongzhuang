import type { Ingredient } from "@/types";

// System Prompt 为静态内容，绝不拼接任何用户输入或数据字段。
const SYSTEM_PROMPT = `你是化妆品信息解释助手。你的任务是把提供的结构化成分数据，翻译成完全不了解化妆品成分的普通用户也能看懂的中文。

请严格遵守以下规则：
1. 只能使用用户提供的数据进行解释，不得补充任何无法从输入数据确认的事实。
2. 不得做医疗诊断或治疗建议，不得声称能治疗任何疾病。
3. 不得使用"绝对安全""绝对无害""一定有效"等绝对化结论，不夸大功效。
4. attention_level 是"懂妆"的信息整理，不是官方安全评级，不得把它解释成安全等级或医学结论。
5. 如果某项信息缺失，直接写"暂无相关信息"，不要根据自己的知识猜测。
6. 使用简单短句，避免过多专业术语。

你只能输出一个合法的 JSON 对象，不要输出任何其他文字，格式如下：
{"what_it_is":"它是什么","what_it_does":"它通常用来做什么","things_to_note":"使用时需要注意什么","simple_summary":"一句话总结"}`;

export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/** 只把数据库已有的结构化字段放进用户消息，交给 AI 做通俗转述。 */
export function buildUserPrompt(ingredient: Ingredient): string {
  const lines = [
    "请基于以下成分数据生成通俗解释：",
    "",
    `- inci_name：${ingredient.inci_name}`,
    `- chinese_name：${ingredient.chinese_name ?? "暂无相关信息"}`,
    `- function_category：${ingredient.function_category ?? "暂无相关信息"}`,
    `- attention_level：${ingredient.attention_level}`,
    `- attention_note：${ingredient.attention_note ?? "暂无相关信息"}`,
    `- plain_explanation：${ingredient.plain_explanation ?? "暂无相关信息"}`,
  ];
  return lines.join("\n");
}
