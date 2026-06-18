"use client";

import { useEffect, useRef, useCallback } from "react";

interface ChessShaderBackgroundProps {
  className?: string;
}

export function ChessShaderBackground({ className = "" }: ChessShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
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

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
    const onVisChange = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", onVisChange);

    // Perspective floor parameters
    const FOCAL = 380;
    const CAM_H = 260;
    const CELL = 80;
    const COLS = 28;
    const ROWS = 20;
    const HALF_COLS = Math.floor(COLS / 2);
    const HORIZON_FRAC = 0.42;

    function project(wx: number, wz: number, w: number, horizY: number) {
      if (wz <= 1) return null;
      const s = FOCAL / wz;
      return { x: w / 2 + wx * s, y: horizY + CAM_H * s, s };
    }

    let lastDrawTime = 0;
    const FRAME_INTERVAL = 1000 / 30; // cap at 30fps

    const draw = (time: number) => {
      animRef.current = requestAnimationFrame(draw);
      if (hidden) return;
      const elapsed = time - lastDrawTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastDrawTime = time - (elapsed % FRAME_INTERVAL);

      const t = time * 0.001;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const horizY = h * HORIZON_FRAC;

      // Smooth mouse — lerp toward raw position each frame
      const sm = smoothMouseRef.current;
      sm.x += (mouseRef.current.x - sm.x) * 0.025;
      sm.y += (mouseRef.current.y - sm.y) * 0.025;

      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, w, h);

      // Floor scrolls toward viewer: as scrollOff increases, wz decreases
      const scrollOff = (t * 22) % CELL;

      // Draw back to front so near cells paint over far cells
      for (let row = ROWS - 1; row >= 0; row--) {
        const wz0 = (row + 1) * CELL - scrollOff; // far edge of this row
        const wz1 = row * CELL - scrollOff;        // near edge
        if (wz0 <= 1) continue;
        const effWz1 = Math.max(wz1, 1);

        for (let col = 0; col < COLS; col++) {
          const wx0 = (col - HALF_COLS) * CELL;
          const wx1 = wx0 + CELL;

          const p00 = project(wx0, wz0, w, horizY);
          const p10 = project(wx1, wz0, w, horizY);
          const p01 = project(wx0, effWz1, w, horizY);
          const p11 = project(wx1, effWz1, w, horizY);
          if (!p00 || !p10 || !p01 || !p11) continue;

          // Coarse culling
          if (
            Math.min(p00.x, p10.x, p01.x, p11.x) > w ||
            Math.max(p00.x, p10.x, p01.x, p11.x) < 0 ||
            Math.min(p00.y, p10.y, p01.y, p11.y) > h
          ) continue;

          const isLight = (row + col) % 2 === 0;
          const avgZ = (wz0 + effWz1) * 0.5;
          const maxZ = ROWS * CELL;

          // Depth fade: far cells are dimmer
          const depthFade = Math.pow(Math.max(0, 1 - avgZ / maxZ), 0.7);
          // Near fade: smoothly fade in cells that enter the near plane
          const nearFade = Math.min(1, (avgZ - 1) / (CELL * 1.5));

          // Mouse proximity glow in screen space
          const cellX = (p00.x + p10.x + p01.x + p11.x) * 0.25;
          const cellY = (p00.y + p10.y + p01.y + p11.y) * 0.25;
          const dx = cellX - sm.x * w;
          const dy = cellY - sm.y * h;
          const mouseGlow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 240);

          // Pulse wave emanating from horizon
          const wave = Math.sin(avgZ / CELL * 0.65 - t * 0.65) * 0.5 + 0.5;

          const baseAlpha = isLight ? 0.06 : 0.022;
          const alpha = Math.min(
            0.22,
            baseAlpha * depthFade * nearFade * (0.65 + wave * 0.35) +
            mouseGlow * mouseGlow * 0.15 * depthFade
          );

          if (alpha < 0.003) continue;

          ctx.beginPath();
          ctx.moveTo(p01.x, p01.y); // near-left
          ctx.lineTo(p11.x, p11.y); // near-right
          ctx.lineTo(p10.x, p10.y); // far-right
          ctx.lineTo(p00.x, p00.y); // far-left
          ctx.closePath();
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();

          const lineAlpha = depthFade * nearFade * 0.07 + mouseGlow * 0.04;
          if (lineAlpha > 0.008) {
            ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Horizon atmospheric line
      const horizGrad = ctx.createLinearGradient(0, horizY - 80, 0, horizY + 60);
      horizGrad.addColorStop(0, "rgba(255,255,255,0)");
      horizGrad.addColorStop(0.5, "rgba(255,255,255,0.03)");
      horizGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = horizGrad;
      ctx.fillRect(0, horizY - 80, w, 140);

      // Radial glow behind globe area
      const glowR = Math.min(w, h) * 0.48;
      const pulse = 1 + Math.sin(t * 0.75) * 0.09;
      const glow = ctx.createRadialGradient(w * 0.65, h * 0.38, 0, w * 0.65, h * 0.38, glowR * pulse);
      glow.addColorStop(0, "rgba(255,255,255,0.05)");
      glow.addColorStop(0.35, "rgba(255,255,255,0.02)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Mouse spotlight
      const spot = ctx.createRadialGradient(sm.x * w, sm.y * h, 0, sm.x * w, sm.y * h, 300);
      spot.addColorStop(0, "rgba(255,255,255,0.04)");
      spot.addColorStop(0.45, "rgba(255,255,255,0.012)");
      spot.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      // Sky fog blending into horizon from above
      const fog = ctx.createLinearGradient(0, 0, 0, horizY);
      fog.addColorStop(0, "rgba(8,8,8,1)");
      fog.addColorStop(0.6, "rgba(8,8,8,0.55)");
      fog.addColorStop(1, "rgba(8,8,8,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, horizY);
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
