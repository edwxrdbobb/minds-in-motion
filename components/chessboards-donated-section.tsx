"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Globe2 } from "lucide-react";
import { gsap } from "gsap";
import { Boxes } from "@/components/ui/background-tiles";

function SolariDigit({ target, delay }: { target: string; delay: number }) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const flip = (value: string, dur: number) => {
      const tl = gsap.timeline();
      tl.to(el, { scaleY: 0, duration: dur * 0.5, ease: "power2.in" })
        .call(() => { el.textContent = value; })
        .to(el, { scaleY: 1, duration: dur * 0.5, ease: "power2.out" });
      return tl;
    };

    const run = () => {
      let remaining = 6 + Math.floor(Math.random() * 3);
      const tick = () => {
        if (remaining <= 0) { flip(target, 0.3); return; }
        remaining--;
        flip(Math.floor(Math.random() * 10).toString(), 0.14);
        setTimeout(tick, 150);
      };
      tick();
    };

    const timer = setTimeout(run, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <span ref={elRef} style={{ display: "inline-block", willChange: "transform" }}>
      {target}
    </span>
  );
}

function SolariCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(false);
  const digits = target.toString().split("");

  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => setActive(true), 300);
    return () => clearTimeout(t);
  }, [isInView]);

  return (
    <span ref={ref} style={{ display: "inline-flex", gap: "4px", perspective: "800px" }}>
      {active
        ? digits.map((d, i) => <SolariDigit key={i} target={d} delay={i * 120} />)
        : digits.map((d, i) => <span key={i} style={{ display: "inline-block" }}>{d}</span>)}
    </span>
  );
}

export function ChessboardsDonatedSection() {
  return (
    <section className="relative py-16 overflow-hidden bg-white">
      {/* B&W isometric grid — dark lines on white bg */}
      <Boxes className="opacity-10" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
            <Globe2 className="w-4 h-4 text-gray-900" />
            <span className="text-sm text-gray-600 font-medium">Our Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Chessboards Donated
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          <div className="relative inline-block">
            <div className="text-8xl sm:text-9xl lg:text-[10rem] font-bold text-gray-900">
              <SolariCounter target={201} />
            </div>
          </div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold text-black/20 ml-2"
          >
            +
          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-lg text-gray-500 mt-8 max-w-2xl mx-auto leading-relaxed"
        >
          Each chessboard represents an opportunity for learning, connection, and
          growth. Donated to schools and community centers across Nepal, Ghana,
          and beyond.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 flex flex-wrap justify-center gap-8"
        >
          {[
            { label: "Schools Reached", value: "15+" },
            { label: "Countries Active", value: "2" },
            { label: "Community Centers", value: "8+" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/5 backdrop-blur-sm border border-black/10 rounded-xl px-6 py-4 min-w-[140px]"
            >
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
