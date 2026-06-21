import type { ReactNode } from "react";
import { ChessPageHeader } from "@/components/chess/chess-page-header";

export default function ChessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <ChessPageHeader />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
