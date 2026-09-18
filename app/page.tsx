import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">懂妆</h1>
      <p className="mt-3 text-lg text-zinc-600">让化妆品变得看得懂</p>
      <p className="mt-2 text-sm text-zinc-400">搜索产品，看懂成分</p>
      <div className="mt-8 w-full">
        <SearchBar />
      </div>
    </div>
  );
}
