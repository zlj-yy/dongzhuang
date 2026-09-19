import Link from "next/link";
import type { Product } from "@/types";
import ProductImage from "@/components/ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <li>
      <Link
        href={`/product/${product.id}`}
        className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400"
      >
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="h-20 w-20"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-400">{product.brand}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <h2 className="font-medium text-zinc-900">{product.name}</h2>
            <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              {product.category}
            </span>
          </div>
          {product.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-zinc-400">
              {product.description}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
