"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/chess/play", label: "Play" },
  { href: "/chess/learn", label: "Learn" },
];

export function ChessPageHeader() {
  const pathname = usePathname();

  return (
    <div className="relative z-40 bg-black/60 border-b border-white/10 sticky top-0 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </Button>

          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
            {TABS.map((tab) => (
              <Button
                key={tab.href}
                asChild
                size="sm"
                variant="ghost"
                className={cn(
                  "rounded-full text-white/60 hover:text-white hover:bg-white/10",
                  pathname?.startsWith(tab.href) && "bg-white/15 text-white",
                )}
              >
                <Link href={tab.href}>{tab.label}</Link>
              </Button>
            ))}
          </div>

          <Link href="/chess" className="flex items-center gap-2">
            <img src={images.logo} alt="Minds in Motion" className="w-8 h-8 rounded-lg object-cover" />
            <span className="hidden text-sm font-semibold text-white sm:inline">Minds in Motion</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
