"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Swords, GraduationCap, ArrowRight } from "lucide-react";

const options = [
  {
    id: "play",
    icon: Swords,
    eyebrow: "Test Your Skills",
    title: "Play Chess",
    description:
      "Jump straight into a game against the computer. Make your moves, sharpen your tactics, and enjoy chess right here in your browser.",
    cta: "Play Now",
    href: "/chess/play",
  },
  {
    id: "learn",
    icon: GraduationCap,
    eyebrow: "Start From Scratch",
    title: "Learn Chess",
    description:
      "New to the game? Follow guided, interactive lessons that take you from the rules of each piece to winning strategies, one step at a time.",
    cta: "Start Learning",
    href: "/chess/learn",
  },
];

export function PlayLearnSection() {
  const router = useRouter();

  return (
    <section id="play-learn" className="relative py-24 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
            <Swords className="w-4 h-4 text-gray-900" />
            <span className="text-sm text-gray-600">Get Hands-On</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Make Your First Move
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Experience the game at the heart of our mission. Whether you&apos;re
            a complete beginner or ready for a challenge, the board is set.
          </p>
        </motion.div>

        {/* Option cards */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group relative flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-gray-400 hover:shadow-md"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-colors">
                <option.icon className="w-7 h-7 text-gray-900 group-hover:text-white transition-colors" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
                {option.eyebrow}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {option.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                {option.description}
              </p>

              <Button
                size="lg"
                onClick={() => router.push(option.href)}
                className="mt-auto w-full bg-gray-900 text-white hover:bg-gray-800 group/btn"
              >
                {option.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Hub link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/chess")}
            className="text-gray-900 hover:bg-gray-100 group"
          >
            Explore the Chess Hub
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
