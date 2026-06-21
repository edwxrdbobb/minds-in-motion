import type { Color, PieceSymbol } from "chess.js";

interface ChessPieceIconProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
}

function renderShape(type: PieceSymbol, accent: string) {
  switch (type) {
    case "p":
      return (
        <>
          <circle cx="22.5" cy="13" r="6.5" />
          <path d="M16 36 L18 22 L27 22 L29 36 Z" />
          <rect x="13" y="36" width="19" height="4" rx="1" />
        </>
      );
    case "r":
      return (
        <>
          <rect x="10" y="13" width="7" height="6" />
          <rect x="19" y="13" width="7" height="6" />
          <rect x="28" y="13" width="7" height="6" />
          <path d="M10 19 H35 L32 36 H13 Z" />
          <rect x="9" y="36" width="27" height="4" rx="1" />
        </>
      );
    case "b":
      return (
        <>
          <circle cx="22.5" cy="10" r="3" />
          <path d="M22.5 14 C16.5 18 15 26 19 34 L26 34 C30 26 28.5 18 22.5 14 Z" />
          <path d="M18.5 21 L26.5 27" stroke={accent} strokeWidth="1.5" fill="none" />
          <rect x="13" y="34" width="19" height="4" rx="1" />
        </>
      );
    case "n":
      return (
        <>
          <path d="M14 36 C13 30 14 25 18 22 C16 19 16 15 19 12 C21 10 24 10 25 12 L27 11 C29 10 31 11 31 13 C31 15 29 16 29 16 L31 19 C33 22 33 27 32 31 L33 36 Z" />
          <circle cx="26.5" cy="16" r="1.1" fill={accent} stroke="none" />
          <rect x="12" y="36" width="23" height="4" rx="1" />
        </>
      );
    case "q":
      return (
        <>
          <circle cx="11" cy="11" r="2.3" />
          <circle cx="22.5" cy="8" r="2.5" />
          <circle cx="34" cy="11" r="2.3" />
          <circle cx="16.5" cy="11" r="1.8" />
          <circle cx="28.5" cy="11" r="1.8" />
          <path d="M11 13 L34 13 L31 30 C31 30 27 28 22.5 28 C18 28 14 30 14 30 Z" />
          <rect x="12" y="30" width="21" height="4" rx="1" />
        </>
      );
    case "k":
      return (
        <>
          <rect x="20.5" y="5" width="4" height="9" />
          <rect x="17" y="8" width="11" height="4" />
          <path d="M14 18 L31 18 L28 34 C28 34 25 32 22.5 32 C20 32 17 34 17 34 Z" />
          <rect x="12" y="34" width="21" height="4" rx="1" />
        </>
      );
    default:
      return null;
  }
}

/** Minimal original monochrome-friendly chess piece icon. */
export function ChessPieceIcon({ type, color, className }: ChessPieceIconProps) {
  const fill = color === "w" ? "#f4f4f2" : "#2b2b2b";
  const stroke = color === "w" ? "#262626" : "#f4f4f2";

  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
      <g fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
        {renderShape(type, stroke)}
      </g>
    </svg>
  );
}
