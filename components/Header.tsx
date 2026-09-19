import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          懂妆
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            搜索
          </Link>
        </nav>
      </div>
    </header>
  );
}
