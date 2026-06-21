"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Swords, GraduationCap, ArrowRight } from "lucide-react";

const OPTIONS = [
  {
    href: "/chess/play",
    title: "Play vs Computer",
    description: "Play a full game against an adjustable computer opponent, with live coaching feedback after every move.",
    icon: Swords,
  },
  {
    href: "/chess/learn",
    title: "Learn to Play",
    description: "An interactive, bite-sized curriculum — from how each piece moves to your first checkmate patterns.",
    icon: GraduationCap,
  },
];

export default function ChessHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold text-white sm:text-5xl">Chess at Minds in Motion</h1>
        <p className="mt-4 text-lg text-white/60">
          The same game we teach in Nepal and Ghana — now playable right here.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        {OPTIONS.map((option, index) => (
          <motion.div
            key={option.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              href={option.href}
              className="group flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.03] p-8 transition-all hover:border-white/30 hover:bg-white/[0.06]"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                <option.icon className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-3 text-xl font-bold text-white">{option.title}</h2>
              <p className="mb-6 flex-1 text-white/60">{option.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
