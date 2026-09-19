import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import type { IngredientWithPosition } from "@/lib/products";
import { displayCategory } from "@/lib/category";
import IngredientTable from "@/components/IngredientTable";
import ProductImage from "@/components/ProductImage";

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const detail = await getProductById(id);
  return {
    title: detail ? `${detail.product.name} · 懂妆` : "产品不存在 · 懂妆",
    description: detail
      ? `${detail.product.brand} ${detail.product.name} 的成分列表与产品信息`
      : "产品不存在",
  };
}

/** 成分功能概览的分组结果：按用户显示分类归类，未分类的单独收集 */
interface CategoryGroup {
  category: string;
  items: IngredientWithPosition[];
}

/**
 * 只依据数据库已有的 function_category 分组（经用户显示映射合并），
 * 不做任何功效推断。
 */
function groupByCategory(ingredients: IngredientWithPosition[]): {
  groups: CategoryGroup[];
  uncategorized: IngredientWithPosition[];
} {
  const map = new Map<string, IngredientWithPosition[]>();
  const uncategorized: IngredientWithPosition[] = [];

  for (const ing of ingredients) {
    if (ing.function_category) {
      const category = displayCategory(ing.function_category);
      const list = map.get(category);
      if (list) list.push(ing);
      else map.set(category, [ing]);
    } else {
      uncategorized.push(ing);
    }
  }

  // Map 保持插入顺序，即分组按成分表中的首次出现顺序排列
  const groups: CategoryGroup[] = [...map.entries()].map(
    ([category, items]) => ({ category, items }),
  );
  return { groups, uncategorized };
}

/** 基本信息里的一行「标签 + 值」 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-zinc-400">{label}</dt>
      <dd className="min-w-0 break-all text-zinc-700">{value}</dd>
    </div>
  );
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const detail = await getProductById(id);

  if (!detail) {
    notFound();
  }

  const { product, ingredients } = detail;
  const { groups, uncategorized } = groupByCategory(ingredients);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← 返回首页
      </Link>

      {/* 产品基本信息（含首屏「成分概览」） */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="mb-4 h-24 w-24"
        />

        <p className="text-sm text-zinc-500">{product.brand}</p>
        <h1 className="mt-1 text-xl font-semibold leading-snug text-zinc-900">
          {product.name}
        </h1>

        <dl className="mt-5 space-y-2.5 text-sm">
          <InfoRow label="分类" value={product.category} />
          {product.spec ? <InfoRow label="规格" value={product.spec} /> : null}
          {product.filing_no ? (
            <InfoRow label="备案号" value={product.filing_no} />
          ) : null}
          {product.verification_status ? (
            <InfoRow label="数据状态" value="公开资料交叉核验" />
          ) : null}
        </dl>

        {product.description ? (
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            {product.description}
          </p>
        ) : null}

        {/* 成分概览：仅按已有 function_category 聚合，不做功效推断 */}
        {groups.length > 0 ? (
          <div className="mt-5 border-t border-zinc-100 pt-4">
            <p className="text-xs text-zinc-400">成分概览</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {groups.map((group) => (
                <span
                  key={group.category}
                  className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
                >
                  {group.category}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* 成分功能概览 */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-zinc-900">成分功能概览</h2>
        <p className="mt-1 text-xs text-zinc-400">
          按已收录的功能分类整理，仅供参考
        </p>

        {groups.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            暂无已收录的功能分类信息
          </p>
        ) : (
          <div className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white px-4">
            {groups.map((group) => (
              <div key={group.category} className="py-3.5">
                <h3 className="text-sm font-medium text-zinc-800">
                  {group.category}
                </h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {group.items.map((ing) => (
                    <li key={ing.id}>
                      <Link
                        href={`/ingredient/${ing.id}`}
                        className="inline-block rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
                      >
                        {ing.chinese_name ?? ing.inci_name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {uncategorized.length > 0 ? (
          <p className="mt-3 text-xs text-zinc-400">
            另有 {uncategorized.length} 种成分暂未收录功能分类，可在下方完整成分表中查看。
          </p>
        ) : null}
      </section>

      {/* 完整成分表（默认折叠，展开/收起为客户端交互） */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-zinc-900">完整成分表</h2>
        <p className="mt-1 text-xs text-zinc-400">
          成分按含量从高到低排列（1% 以下顺序可能不严格）
        </p>
        <IngredientTable ingredients={ingredients} />
      </section>

      {/* 数据说明 */}
      <section className="mt-8">
        <p className="border-t border-zinc-100 pt-4 text-xs leading-5 text-zinc-400">
          数据说明：当前信息根据公开商品及成分资料整理，部分资料可能存在版本差异，请以产品实际包装及官方/监管信息为准。
        </p>
      </section>
    </div>
  );
}
