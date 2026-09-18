import Link from "next/link";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <li>
      <Link
        href={`/product/${product.id}`}
        className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-medium text-zinc-900">{product.name}</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            {product.category}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">{product.brand}</p>
        {product.description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {product.description}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
