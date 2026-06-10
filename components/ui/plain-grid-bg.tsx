import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

export const PlainGridBg = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Soft Yellow Glow */}
  <div
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: `
        radial-gradient(circle at center, #FFF991 0%, transparent 70%)
      `,
      opacity: 0.6,
      mixBlendMode: "multiply",
    }}
  />
    {children}
</div>
  );
};
