"use client";

import { useState } from "react";
import type { AiExplanationContent } from "@/types";

interface AiExplainProps {
  ingredientId: string;
  aiConfigured: boolean;
}

type ViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; content: AiExplanationContent }
  | { status: "error"; message: string };

export default function AiExplain({ ingredientId, aiConfigured }: AiExplainProps) {
  const [state, setState] = useState<ViewState>({ status: "idle" });

  async function handleClick() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({
          status: "error",
          message: data?.error ?? "AI 解释暂不可用，请稍后重试",
        });
        return;
      }
      setState({ status: "success", content: data.content });
    } catch {
      setState({ status: "error", message: "AI 解释暂不可用，请稍后重试" });
    }
  }

  if (!aiConfigured) {
    return (
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">AI 通俗解释</h2>
        <p className="mt-2 text-sm text-zinc-400">AI 通俗解释暂未开通</p>
      </div>
    );
  }

  const isLoading = state.status === "loading";

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-900">AI 通俗解释</h2>
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className="shrink-0 rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "翻译中…" : "AI 通俗解释"}
        </button>
      </div>

      {state.status === "loading" && (
        <p className="mt-4 text-sm text-zinc-400">
          正在把专业信息翻译成人话…
        </p>
      )}

      {state.status === "success" && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-700">它是什么？</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {state.content.what_it_is}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700">
              它通常用来做什么？
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {state.content.what_it_does}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700">
              使用时需要注意什么？
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {state.content.things_to_note}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700">一句话总结</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {state.content.simple_summary}
            </p>
          </div>
          <p className="text-xs text-zinc-400">
            以上由 AI 基于成分数据生成，仅供科普参考。
          </p>
        </div>
      )}

      {state.status === "error" && (
        <p className="mt-4 text-sm text-zinc-500">{state.message}</p>
      )}
    </div>
  );
}
