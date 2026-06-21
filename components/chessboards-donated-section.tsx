"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Globe2 } from "lucide-react";
import { gsap } from "gsap";
import { Boxes } from "@/components/ui/background-tiles";
import { images } from "@/lib/cloudinary";

// ─── Single split-flap card ───────────────────────────────────────────────────
function SolariDigit({ value, settle }: { value: string; settle: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Final flourish flip once the count lands on its target value
  useEffect(() => {
    if (!settle) return;
    const card = cardRef.current;
    if (!card) return;
    gsap
      .timeline()
      .to(card, { rotateX: -90, duration: 0.18, ease: "power2.in" })
      .set(card, { rotateX: 90 })
      .to(card, { rotateX: 0, duration: 0.22, ease: "power2.out" });
  }, [settle]);

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
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Row of cards ─────────────────────────────────────────────────────────────
function SolariCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const numDigits = String(target).length;
  const [current, setCurrent] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: "easeOut",
      onUpdate: (v) => setCurrent(Math.floor(v)),
      onComplete: () => setSettled(true),
    });
    return () => controls.stop();
  }, [isInView, target]);

  const digits = String(current).padStart(numDigits, "0").split("");

  return (
    <div
      ref={ref}
      style={{ display: "inline-flex", gap: 10, alignItems: "center" }}
    >
      {digits.map((d, i) => (
        <SolariDigit key={i} value={d} settle={settled} />
      ))}
    </div>
  );
}

// ─── Photo collage ────────────────────────────────────────────────────────────
function DonationPhotos() {
  return (
    <div className="relative h-full min-h-[320px] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -6 }}
        whileInView={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute left-2 sm:left-6 top-0 w-40 sm:w-52 aspect-[4/5] rounded-2xl overflow-hidden border border-black/10 shadow-xl bg-white"
      >
        <img
          src={images.nepalChessOutdoorCircle}
          alt="Students and volunteers gathered around chessboards outdoors in Nepal"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: 6 }}
        whileInView={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute right-2 sm:right-6 bottom-0 w-40 sm:w-52 aspect-[4/5] rounded-2xl overflow-hidden border border-black/10 shadow-xl bg-white"
      >
        <img
          src={images.nepalChessStudentSmiling}
          alt="A student smiling during a chess lesson"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function ChessboardsDonatedSection() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      <Boxes className="opacity-10" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Counter column */}
          <div className="text-center lg:text-left">
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
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <SolariCounter target={201} />

              {/* Plus sign */}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 2.3 }}
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
              className="flex justify-center lg:justify-start mt-3 mb-2"
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
              className="text-lg text-gray-500 mt-6 max-w-xl mx-auto lg:mx-0 leading-relaxed"
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
              className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6"
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

          {/* Photo column */}
          <DonationPhotos />
        </div>
      </div>
    </section>
  );
}
