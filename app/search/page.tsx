import type { Metadata } from "next";
import Link from "next/link";
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

  // 无搜索关键词
  if (!query) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <SearchBar />
        <div className="mt-12 text-center">
          <p className="text-base text-zinc-600">
            输入产品名、品牌或成分开始搜索。
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            例如：薇诺娜、烟酰胺、甘油
          </p>
        </div>
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
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <SearchBar defaultValue={query} />

      {results.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-base font-medium text-zinc-900">没有找到相关内容</p>
          <p className="mt-3 text-sm text-zinc-500">你可以尝试：</p>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-500">
            <li>· 检查关键词是否正确</li>
            <li>· 搜索品牌名称</li>
            <li>· 搜索具体成分名称</li>
          </ul>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-700"
          >
            ← 返回首页
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <h1 className="text-lg font-semibold text-zinc-900">
            “{query}”的搜索结果
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            找到 {results.length} 个相关产品
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
