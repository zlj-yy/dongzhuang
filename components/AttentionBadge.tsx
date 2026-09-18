import type { AttentionLevel } from "@/types";

// 中性文案，仅表示「懂妆」的信息整理，不代表官方安全评级
const LABELS: Record<AttentionLevel, string> = {
  1: "常见成分",
  2: "需留意",
  3: "使用注意",
};

const STYLES: Record<AttentionLevel, string> = {
  1: "bg-zinc-100 text-zinc-700",
  2: "bg-amber-50 text-amber-800 border border-amber-200",
  3: "bg-orange-50 text-orange-800 border border-orange-200",
};

export default function AttentionBadge({
  level,
}: {
  level: AttentionLevel | null;
}) {
  if (level === null) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${STYLES[level]}`}
    >
      关注提示：{LABELS[level]}
    </span>
  );
}
