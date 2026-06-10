"use client";

import { useEffect, useRef, useCallback } from "react";

interface ChessShaderBackgroundProps {
  className?: string;
}

export function ChessShaderBackground({
  className = "",
}: ChessShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    window.addEventListener("mousemove", handleMouseMove);

    let hidden = false;
    const onVisChange = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisChange);

    const draw = (time: number) => {
      if (hidden) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const t = time * 0.001; // seconds
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Clear with deep black
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // --- Animated checkerboard grid ---
      const cellSize = 60;
      // Slow diagonal scroll
      const offsetX = t * 8;
      const offsetY = t * 5;
      const cols = Math.ceil(w / cellSize) + 2;
      const rows = Math.ceil(h / cellSize) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * cellSize + (offsetX % cellSize) - cellSize;
          const y = row * cellSize + (offsetY % cellSize) - cellSize;

          const isLight = (col + row) % 2 === 0;

          // Distance from cell center to mouse (normalized)
          const cellCenterX = (x + cellSize / 2) / w;
          const cellCenterY = (y + cellSize / 2) / h;
          const distToMouse = Math.sqrt(
            (cellCenterX - mx) ** 2 + (cellCenterY - my) ** 2
          );

          // Distance from cell center to screen center
          const distToCenter = Math.sqrt(
            (cellCenterX - 0.5) ** 2 + (cellCenterY - 0.5) ** 2
          );

          // Base opacity: fades from center outward
          const centerFade = Math.max(0, 1 - distToCenter * 1.5);
          // Mouse proximity boost
          const mouseGlow = Math.max(0, 1 - distToMouse * 3);
          // Pulsing wave from center
          const wave =
            Math.sin(distToCenter * 10 - t * 1.5) * 0.5 + 0.5;

          const baseAlpha = isLight ? 0.035 : 0.015;
          const alpha =
            baseAlpha * centerFade * (0.6 + wave * 0.4) +
            baseAlpha * mouseGlow * 2;

          if (alpha > 0.002) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.12)})`;
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }

      // --- Center radial glow (behind the globe) ---
      const glowRadius = Math.min(w, h) * 0.5;
      const pulseScale = 1 + Math.sin(t * 0.8) * 0.1;
      const gradient = ctx.createRadialGradient(
        w * 0.65,
        h * 0.45,
        0,
        w * 0.65,
        h * 0.45,
        glowRadius * pulseScale
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.04)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.02)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // --- Mouse spotlight ---
      const spotlightGrad = ctx.createRadialGradient(
        mx * w,
        my * h,
        0,
        mx * w,
        my * h,
        300
      );
      spotlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.035)");
      spotlightGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.01)");
      spotlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = spotlightGrad;
      ctx.fillRect(0, 0, w, h);

      // --- Subtle grid lines (like a chessboard border) ---
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 0.5;
      for (let col = 0; col < cols; col++) {
        const x = col * cellSize + (offsetX % cellSize) - cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let row = 0; row < rows; row++) {
        const y = row * cellSize + (offsetY % cellSize) - cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // --- Floating chess piece silhouettes (very subtle) ---
      const pieces = [
        { x: 0.15, y: 0.7, size: 20, speed: 0.3, phase: 0 },
        { x: 0.85, y: 0.2, size: 16, speed: 0.4, phase: 1.5 },
        { x: 0.1, y: 0.3, size: 14, speed: 0.25, phase: 3 },
        { x: 0.9, y: 0.8, size: 18, speed: 0.35, phase: 4.5 },
      ];

      for (const piece of pieces) {
        const px = piece.x * w;
        const py =
          piece.y * h + Math.sin(t * piece.speed + piece.phase) * 20;
        const s = piece.size;
        const pieceAlpha = 0.03 + Math.sin(t * 0.5 + piece.phase) * 0.015;

        ctx.fillStyle = `rgba(255, 255, 255, ${pieceAlpha})`;
        ctx.beginPath();
        // Simple pawn silhouette
        ctx.arc(px, py - s * 0.6, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px - s * 0.4, py + s * 0.3);
        ctx.lineTo(px + s * 0.4, py + s * 0.3);
        ctx.lineTo(px + s * 0.2, py - s * 0.1);
        ctx.lineTo(px - s * 0.2, py - s * 0.1);
        ctx.closePath();
        ctx.fill();
        // Base
        ctx.fillRect(px - s * 0.45, py + s * 0.3, s * 0.9, s * 0.15);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
    />
  );
}
