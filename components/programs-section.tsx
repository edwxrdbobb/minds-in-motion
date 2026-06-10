"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Lightbulb, Users2, Heart } from "lucide-react";

const cards = [
  {
    id: "mission",
    title: "Our Mission",
    description:
      "To empower youth worldwide through chess education, fostering critical thinking and resilience in underserved communities.",
    icon: Target,
    gradient: "from-primary/20 to-primary/5",
    link: "#about",
  },
  {
    id: "programs",
    title: "Our Programs",
    description:
      "From school chess clubs to community workshops, we provide equipment, training, and ongoing support for sustainable impact.",
    icon: Lightbulb,
    gradient: "from-accent/20 to-accent/5",
    link: "#contact",
  },
  {
    id: "team",
    title: "Our Team",
    description:
      "A passionate group of chess enthusiasts, educators, and volunteers dedicated to making chess accessible to all.",
    icon: Users2,
    gradient: "from-chart-4/20 to-chart-4/5",
    link: "#contact",
  },
];

export function ProgramsSection() {
  const router = useRouter();
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="mission" className="relative py-24 overflow-hidden bg-white">
      {/* Background - white section */}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
            <Heart className="w-4 h-4 text-gray-900" />
            <span className="text-sm text-gray-600">What We Do</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Mission, Programs & Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how Minds in Motion is changing lives through the strategic
            power of chess
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              id={card.id === "programs" ? "programs" : card.id === "team" ? "team" : undefined}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group relative"
            >
              <div className="relative h-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-8 overflow-hidden transition-all duration-300 hover:border-gray-400 hover:shadow-md">
                {/* Gradient background */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                    <card.icon className="w-7 h-7 text-gray-900" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {card.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {card.description}
                  </p>

                  <Button
                    variant="ghost"
                    onClick={() => scrollToSection(card.link)}
                    className="group/btn px-0 hover:bg-transparent text-gray-900 hover:text-gray-600"
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Decorative corner */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gray-200/50 rounded-full blur-xl group-hover:bg-gray-300/50 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-6">
            Ready to make a difference in a young person&apos;s life?
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/checkout")}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            Get Involved Today
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
