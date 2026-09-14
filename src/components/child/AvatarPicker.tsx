"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AVATAR_OPTIONS } from "@/lib/childOptions";

export function AvatarPicker({ defaultValue }: { defaultValue?: string }) {
  const [selected, setSelected] = useState(defaultValue ?? AVATAR_OPTIONS[0]);

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pilih avatar">
      <input type="hidden" name="avatarUrl" value={selected} />
      {AVATAR_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="radio"
          aria-checked={selected === emoji}
          onClick={() => setSelected(emoji)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 text-2xl transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selected === emoji ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/50",
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
