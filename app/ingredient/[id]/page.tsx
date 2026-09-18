import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIngredientById } from "@/lib/ingredients";
import AttentionBadge from "@/components/AttentionBadge";
import AiExplain from "@/components/AiExplain";

export async function generateMetadata({
  params,
}: PageProps<"/ingredient/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ingredient = await getIngredientById(id);
  return {
    title: ingredient
      ? `${ingredient.chinese_name ?? ingredient.inci_name} · 懂妆`
      : "成分不存在 · 懂妆",
    description: ingredient
      ? `${ingredient.chinese_name ?? ingredient.inci_name} 是什么、有什么作用、使用时需要注意什么`
      : "成分不存在",
  };
}

export default async function IngredientPage({
  params,
}: PageProps<"/ingredient/[id]">) {
  const { id } = await params;
  const ingredient = await getIngredientById(id);

  if (!ingredient) {
    notFound();
  }

  const displayName = ingredient.chinese_name ?? ingredient.inci_name;
  const aiConfigured = Boolean(process.env.DEEPSEEK_API_KEY);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← 返回首页
      </Link>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">{displayName}</h1>
        {ingredient.chinese_name ? (
          <p className="mt-1 text-sm text-zinc-500">
            INCI 名称：{ingredient.inci_name}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {ingredient.function_category ? (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
              {ingredient.function_category}
            </span>
          ) : null}
          <AttentionBadge level={ingredient.attention_level} />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-zinc-900">它是什么？</h2>
        {ingredient.plain_explanation ? (
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {ingredient.plain_explanation}
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">暂无相关信息</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-zinc-900">
          它通常用来做什么？
        </h2>
        {ingredient.function_category ? (
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {ingredient.function_category}
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">暂无相关信息</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-zinc-900">
          使用时需要注意什么？
        </h2>
        {ingredient.attention_note ? (
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {ingredient.attention_note}
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">暂无相关信息</p>
        )}
      </section>

      <AiExplain ingredientId={ingredient.id} aiConfigured={aiConfigured} />

      <p className="mt-10 border-t border-zinc-100 pt-4 text-xs leading-5 text-zinc-400">
        说明：「关注提示」是懂妆为方便阅读所做的信息整理，仅供科普参考，不代表任何官方安全评级，也不构成医疗建议。
      </p>
    </div>
  );
}
