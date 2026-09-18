export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="get"
      className="mx-auto flex w-full max-w-xl items-center gap-2"
    >
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="输入产品名称或品牌，如：烟酰胺、甘油"
        className="h-12 flex-1 rounded-full border border-zinc-300 bg-white px-5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
      />
      <button
        type="submit"
        className="h-12 shrink-0 rounded-full bg-zinc-900 px-6 text-base text-white transition-colors hover:bg-zinc-700"
      >
        搜索
      </button>
    </form>
  );
}
