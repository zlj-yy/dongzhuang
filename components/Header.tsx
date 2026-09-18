import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          懂妆
        </Link>
        <span className="text-sm text-zinc-500">让化妆品变得看得懂</span>
      </div>
    </header>
  );
}
