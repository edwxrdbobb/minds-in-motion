"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const GOLD = "#C2A35E";
const serif = { fontFamily: 'Georgia, "Times New Roman", serif' };

const stats = [
  { value: "261", label: "Chessboards Delivered", sub: "Across 2 countries" },
  { value: "400+", label: "Children Taught", sub: "Ages 4 – 16" },
  { value: "2", label: "Countries Reached", sub: "Nepal & Ghana" },
];

const genderData = [
  { name: "Male", value: 58, color: "#141414" },
  { name: "Female", value: 42, color: GOLD },
];

const ageData = [
  { group: "Ages 4–7", value: 120, color: GOLD },
  { group: "Ages 7–11", value: 152, color: "#EFE3D6" },
  { group: "Ages 11–16", value: 128, color: "#555555" },
];

export function ImpactReportSection() {
  return (
    <section id="impact" className="relative py-24 overflow-hidden bg-white">
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
            <BarChart3 className="w-4 h-4 text-gray-900" />
            <span className="text-sm text-gray-600">Our Reach</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Impact Report
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A snapshot of the children, communities, and classrooms reached
            through the chessboards we&apos;ve delivered.
          </p>
        </motion.div>

        {/* Headline stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="rounded-2xl bg-[#141414] border border-black/10 shadow-lg overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-10 text-center">
                <div
                  className="text-5xl sm:text-6xl text-white mb-3"
                  style={serif}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-1"
                  style={{ color: GOLD }}
                >
                  {stat.label}
                </div>
                <div className="text-sm text-white/40">{stat.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gender split — dark card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="rounded-2xl bg-[#242424] border border-black/10 shadow-lg p-6 sm:p-8"
          >
            <div
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-1"
              style={{ color: GOLD }}
            >
              By Gender
            </div>
            <h3 className="text-2xl text-white mb-6" style={serif}>
              Gender Split
            </h3>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                    stroke="none"
                  >
                    {genderData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-8 mt-2">
              {genderData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-white/70">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Age group reach — light card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="rounded-2xl bg-[#FAFAF8] border border-black/10 shadow-sm p-6 sm:p-8"
          >
            <div
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-1"
              style={{ color: GOLD }}
            >
              Estimated Children (out of 400+)
            </div>
            <h3 className="text-2xl text-gray-900 mb-6" style={serif}>
              Age Group Reach
            </h3>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageData}
                  margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#ECE7DE" />
                  <XAxis
                    dataKey="group"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6b6b6b", fontSize: 13 }}
                  />
                  <YAxis
                    domain={[0, 200]}
                    ticks={[0, 50, 100, 150, 200]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9b9b9b", fontSize: 13 }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={120}>
                    {ageData.map((entry) => (
                      <Cell key={entry.group} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
