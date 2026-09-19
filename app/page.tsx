import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

// 首页展示真实产品列表，需始终取最新数据（与搜索页一致）
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "懂妆｜让化妆品变得看得懂",
  description: "查化妆品、看成分，用简单的话了解产品和成分。",
};

const EXAMPLE_QUERIES = ["烟酰胺", "甘油", "薇诺娜"];

const VALUE_CARDS = [
  { index: "01", title: "查产品", desc: "看看一款产品有哪些成分。" },
  { index: "02", title: "看成分", desc: "把专业成分名称变成容易理解的话。" },
  {
    index: "03",
    title: "AI 解释",
    desc: "用更简单的语言理解成分作用和注意事项。",
  },
];

export default async function Home() {
  const products = await getFeaturedProducts(6);

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          懂妆
        </h1>
        <p className="mt-3 text-lg text-zinc-600">让化妆品变得看得懂</p>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-500">
          查产品、看成分，用简单的话了解你正在用的化妆品。
        </p>

        <div className="mx-auto mt-8 w-full max-w-xl">
          <SearchBar size="large" />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-zinc-400">试试：</span>
          {EXAMPLE_QUERIES.map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>

      {/* 核心价值 */}
      <section className="pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUE_CARDS.map((item) => (
            <div
              key={item.index}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <span className="text-xs font-medium text-zinc-400">
                {item.index}
              </span>
              <h2 className="mt-3 text-lg font-semibold text-zinc-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 产品探索 */}
      {products.length > 0 ? (
        <section className="pb-16">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">开始探索</h2>
              <p className="mt-1 text-sm text-zinc-500">
                从一款产品开始，看懂它的成分。
              </p>
            </div>
            <Link
              href="/search"
              className="shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-700"
            >
              查看全部 →
            </Link>
          </div>
          <ul className="mt-6 flex flex-col gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
