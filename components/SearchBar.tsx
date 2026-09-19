export default function SearchBar({
  defaultValue = "",
  size = "default",
}: {
  defaultValue?: string;
  size?: "default" | "large";
}) {
  const large = size === "large";
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
        placeholder="搜索品牌、产品名或成分……"
        aria-label="搜索"
        className={`${
          large ? "h-14 px-6 text-lg" : "h-12 px-5 text-base"
        } flex-1 rounded-full border border-zinc-300 bg-white text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200`}
      />
      <button
        type="submit"
        className={`${
          large ? "h-14 px-7" : "h-12 px-6"
        } shrink-0 rounded-full bg-zinc-900 text-base text-white transition-colors hover:bg-zinc-700`}
      >
        搜索
      </button>
    </form>
  );
}
