"use client";

import type { ColorTag } from "@/app/lib/types";

const STYLE_MAP: Record<ColorTag, { bg: string; text: string; border?: string }> = {
  black:      { bg: "#18181b", text: "#ffffff" },
  blue:       { bg: "#3b82f6", text: "#ffffff" },
  brown:      { bg: "#92400e", text: "#ffffff" },
  cream:      { bg: "#fef3c7", text: "#78350f" },
  cyan:       { bg: "#22d3ee", text: "#083344" },
  gold:       { bg: "#eab308", text: "#422006" },
  gray:       { bg: "#a1a1aa", text: "#ffffff" },
  green:      { bg: "#22c55e", text: "#ffffff" },
  orange:     { bg: "#f97316", text: "#ffffff" },
  pink:       { bg: "#f472b6", text: "#ffffff" },
  purple:     { bg: "#a855f7", text: "#ffffff" },
  red:        { bg: "#ef4444", text: "#ffffff" },
  silver:     { bg: "#d4d4d8", text: "#3f3f46" },
  teal:       { bg: "#14b8a6", text: "#ffffff" },
  white:      { bg: "#ffffff", text: "#52525b", border: "#e4e4e7" },
  yellow:     { bg: "#facc15", text: "#422006" },
  multicolor: { bg: "linear-gradient(to right, #f87171, #4ade80, #60a5fa)", text: "#ffffff" },
};

interface ColorTagBadgeProps {
  tag: ColorTag;
}

export function ColorTagBadge({ tag }: ColorTagBadgeProps) {
  const s = STYLE_MAP[tag];
  const isGradient = s.bg.startsWith("linear-gradient");

  return (
    <span
      className="inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        ...(isGradient ? { background: s.bg } : { backgroundColor: s.bg }),
        color: s.text,
        ...(s.border ? { border: `1px solid ${s.border}` } : {}),
      }}
    >
      {tag[0].toUpperCase() + tag.slice(1)}
    </span>
  );
}
