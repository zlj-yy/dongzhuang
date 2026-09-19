"use client";

import { useState } from "react";

interface ProductImageProps {
  /** 产品图片 URL；为 null/空时显示统一占位 */
  src: string | null;
  /** 图片替代文本（无障碍） */
  alt: string;
  /** 追加到图片/占位容器的尺寸与边距类，默认 80×80 */
  className?: string;
}

/**
 * 产品图片（含统一「暂无产品图片」占位）。
 * 使用普通 <img> 而非 next/image：官方产品图域名尚不固定，
 * 普通 <img> 无需 remotePatterns 配置即可显示外部图，
 * 且 onError 可将加载失败回退为占位，避免布局异常。
 */
export default function ProductImage({
  src,
  alt,
  className = "h-20 w-20",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-center text-xs leading-4 text-zinc-400 ${className}`}
      >
        <span>暂无产品图片</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-lg bg-zinc-100 object-cover ${className}`}
    />
  );
}
