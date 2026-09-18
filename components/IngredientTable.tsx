"use client";

import Link from "next/link";
import { useState } from "react";
import type { IngredientWithPosition } from "@/lib/products";
import { displayCategory } from "@/lib/category";
import AttentionBadge from "@/components/AttentionBadge";

/** 完整成分表默认折叠时展示的数量 */
const COLLAPSED_COUNT = 5;

export default function IngredientTable({
  ingredients,
}: {
  ingredients: IngredientWithPosition[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (ingredients.length === 0) {
    return (
      <p className="mt-6 text-center text-sm text-zinc-400">
        该产品暂时没有成分信息
      </p>
    );
  }

  const collapsible = ingredients.length > COLLAPSED_COUNT;
  const visible = expanded || !collapsible
    ? ingredients
    : ingredients.slice(0, COLLAPSED_COUNT);

  return (
    <div>
      <ol className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
        {visible.map((ingredient) => (
          <li
            key={ingredient.id}
            className="transition-colors hover:bg-zinc-50"
          >
            <Link
              href={`/ingredient/${ingredient.id}`}
              className="flex items-start gap-3 px-4 py-3"
            >
              <span className="mt-0.5 w-6 shrink-0 text-center text-xs text-zinc-400">
                {ingredient.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-900">
                  {ingredient.chinese_name ?? ingredient.inci_name}
                </p>
                {ingredient.chinese_name ? (
                  <p className="mt-0.5 break-words text-xs text-zinc-400">
                    {ingredient.inci_name}
                  </p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {ingredient.function_category ? (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                      {displayCategory(ingredient.function_category)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-zinc-400">
                      暂无分类信息
                    </span>
                  )}
                  <AttentionBadge level={ingredient.attention_level} />
                </div>
              </div>
              <span aria-hidden className="mt-0.5 shrink-0 text-zinc-300">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full rounded-xl border border-zinc-200 bg-white py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          {expanded ? "收起成分表" : `查看全部 ${ingredients.length} 个成分`}
        </button>
      ) : null}
    </div>
  );
}
