import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
      <p className="text-3xl font-semibold text-zinc-900">404</p>
      <p className="mt-3 text-sm text-zinc-600">没有找到这个产品</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
      >
        回到首页
      </Link>
    </div>
  );
}
