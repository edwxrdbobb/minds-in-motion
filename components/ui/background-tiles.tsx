"use client";
import React from "react";
import { cn } from "@/lib/utils";

// CSS-only re-implementation of the original 150x100 grid of motion.div
// cells (15,000 DOM nodes + framer-motion bindings), which tanked scroll
// performance on every page that mounted it. Same skewed grid look, one node.
//
// The inner layer is oversized (inset: -75%) and skewed/scaled around its
// own center, so the visible section is always fully covered regardless of
// viewport size — same trick the original got "for free" by way overbuilding
// its 9600x3200px DOM grid.
export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-0",
        className
      )}
      {...rest}
    >
      <div
        style={{
          position: "absolute",
          inset: "-75%",
          transform: "skewX(-48deg) skewY(-4deg) scale(0.675)",
          backgroundImage: [
            "linear-gradient(to right, rgb(51 65 85) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgb(51 65 85) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 32px",
        }}
      />
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
