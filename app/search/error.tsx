"use client";

export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <p className="text-sm text-zinc-600">搜索出错了，请稍后重试。</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-zinc-900 px-5 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
      >
        重试
      </button>
    </div>
  );
}
