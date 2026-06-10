"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Globe2 } from "lucide-react";
import { gsap } from "gsap";
import { Boxes } from "@/components/ui/background-tiles";

// ─── Single split-flap card ───────────────────────────────────────────────────
function SolariDigit({
  target,
  delay,
  active,
}: {
  target: string;
  delay: number;
  active: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;

    const card = cardRef.current;
    const charEl = charRef.current;
    if (!card || !charEl) return;

    // Start from 0, shuffle up through random digits, land on target
    const SHUFFLES = 8 + Math.floor(Math.random() * 5);
    const seq: string[] = [];
    // First flip is always from 0 → first random digit (charRef already shows "0")
    for (let i = 0; i < SHUFFLES; i++) {
      seq.push(String(Math.floor(Math.random() * 10)));
    }
    seq.push(target);

    let idx = 0;

    const flip = (val: string, dur: number, done: () => void) => {
      gsap
        .timeline({ onComplete: done })
        // Phase 1 — fold down to edge (old digit exits)
        .to(card, {
          rotateX: -90,
          duration: dur * 0.45,
          ease: "power2.in",
        })
        // Swap digit at the invisible edge
        .call(() => {
          charEl.textContent = val;
        })
        // Phase 2 — unfold from opposite edge (new digit falls in)
        .set(card, { rotateX: 90 })
        .to(card, {
          rotateX: 0,
          duration: dur * 0.45,
          ease: "power2.out",
        });
    };

    const run = () => {
      if (idx >= seq.length) return;
      const val = seq[idx++];
      const isLast = idx === seq.length;
      flip(val, isLast ? 0.44 : 0.11, () => {
        if (!isLast) setTimeout(run, 52);
      });
    };

    const timer = setTimeout(run, delay);
    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(card);
    };
  }, [active, target, delay]);

  return (
    // Perspective wrapper — do NOT put overflow:hidden here
    <div style={{ perspective: "600px", perspectiveOrigin: "50% 50%" }}>
      <div
        ref={cardRef}
        style={{
          position: "relative",
          width: "clamp(72px, 9vw, 112px)",
          height: "clamp(100px, 12.5vw, 154px)",
          background:
            "linear-gradient(175deg, #252525 0%, #161616 55%, #0d0d0d 100%)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.06)",
            "inset 0 -1px 0 rgba(0,0,0,0.7)",
            "0 20px 60px rgba(0,0,0,0.32)",
            "0 6px 16px rgba(0,0,0,0.22)",
          ].join(", "),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          willChange: "transform",
        }}
      >
        {/* Top-half sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            bottom: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.008) 100%)",
            borderRadius: "10px 10px 0 0",
            pointerEvents: "none",
          }}
        />

        {/* Center seam */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(50% - 1px)",
            height: 2,
            background: "#060606",
            zIndex: 3,
          }}
        />

        {/* Drop-shadow beneath seam for depth */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 8,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* Digit */}
        <span
          ref={charRef}
          style={{
            fontSize: "clamp(70px, 8.5vw, 108px)",
            fontWeight: 900,
            fontFamily: '"Courier New", Courier, monospace',
            color: "#ebebeb",
            lineHeight: 1,
            letterSpacing: "-0.05em",
            userSelect: "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          0
        </span>
      </div>
    </div>
  );
}

// ─── Row of cards ─────────────────────────────────────────────────────────────
function SolariCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const digits = String(target).split("");

  return (
    <div
      ref={ref}
      style={{ display: "inline-flex", gap: 10, alignItems: "center" }}
    >
      {digits.map((d, i) => (
        <SolariDigit key={i} target={d} delay={i * 200} active={isInView} />
      ))}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function ChessboardsDonatedSection() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      <Boxes className="opacity-10" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
            <Globe2 className="w-4 h-4 text-gray-900" />
            <span className="text-sm text-gray-600 font-medium">Our Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Chessboards Donated
          </h2>
        </motion.div>

        {/* Solari board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex items-center justify-center gap-3"
        >
          <SolariCounter target={201} />

          {/* Plus sign */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            viewport={{ once: true }}
            style={{
              fontSize: "clamp(48px, 6vw, 88px)",
              fontWeight: 900,
              fontFamily: '"Courier New", Courier, monospace',
              color: "rgba(0,0,0,0.18)",
              lineHeight: 1,
              alignSelf: "center",
              marginTop: 4,
            }}
          >
            +
          </motion.span>
        </motion.div>

        {/* Reflection line under cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center mt-3 mb-2"
        >
          <div
            style={{
              width: "clamp(230px, 29vw, 360px)",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
            }}
          />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-lg text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed"
        >
          Each chessboard represents an opportunity for learning, connection, and
          growth. Donated to schools and community centers across Nepal, Ghana,
          and beyond.
        </motion.p>

        {/* Mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-10 flex flex-wrap justify-center gap-6"
        >
          {[
            { label: "Schools Reached", value: "15+" },
            { label: "Countries Active", value: "2" },
            { label: "Community Centers", value: "8+" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/5 border border-black/8 rounded-xl px-6 py-4 min-w-[140px]"
            >
              <div
                style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 700,
                }}
                className="text-2xl text-gray-900"
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
