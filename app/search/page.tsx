import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { searchProducts, MAX_QUERY_LENGTH } from "@/lib/products";

export const metadata: Metadata = {
  title: "搜索 · 懂妆",
  description: "按产品名称或品牌搜索化妆品，查看产品与成分信息。",
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim();

  // 空搜索
  if (!query) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <SearchBar />
        <p className="mt-10 text-center text-sm text-zinc-400">
          输入产品名称或品牌，开始搜索
        </p>
      </div>
    );
  }

  // 异常输入（关键词过长）
  if (query.length > MAX_QUERY_LENGTH) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <SearchBar defaultValue={query} />
        <p className="mt-10 text-center text-sm text-zinc-400">
          关键词过长，请精简到 {MAX_QUERY_LENGTH} 字以内后重试
        </p>
      </div>
    );
  }

  const results = await searchProducts(query);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <SearchBar defaultValue={query} />
      <div className="mt-8">
        {results.length === 0 ? (
          <p className="text-center text-sm text-zinc-400">
            没有找到与「{query}」相关的产品，换个关键词试试
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500">
              找到 {results.length} 个相关产品
            </p>
            <ul className="flex flex-col gap-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
