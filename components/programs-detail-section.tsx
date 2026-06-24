"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { images } from "@/lib/cloudinary";
import { FallingPattern } from "@/components/ui/falling-pattern";

// Replace these placeholders with the real Cloudinary keys once uploaded.
const programImages = [
  { src: images.programDetail1, alt: "Students in an interactive chess lesson" },
  { src: images.programDetail2, alt: "Teacher training session" },
  { src: images.programDetail3, alt: "Students celebrating with their Minds in Motion chess set" },
];

export function ProgramsDetailSection() {
  return (
    <section
      id="our-programs"
      className="relative py-24 overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        <FallingPattern
          color="rgba(255,255,255,0.35)"
          backgroundColor="#000000"
          duration={150}
          blurIntensity="1em"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: heading + copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <Lightbulb className="w-4 h-4 text-white" />
              <span className="text-sm text-white/80">What We Do</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Our Programs
            </h2>

            <p className="text-lg text-white/70 leading-relaxed mb-6">
              In our programs we deliver structured interactive lessons to the
              students with the chessboards donated and have specific teacher
              training sessions so that the local teachers have the resources to
              continue this program and form school chess clubs for the future!
            </p>

            <p className="text-lg text-white/70 leading-relaxed">
              We have had amazing feedback from the teachers and students so far
              and their enthusiasm for chess is infectious!
            </p>

            {/* Testimonial quotes */}
            <div className="mt-8 space-y-4">
              <blockquote className="border-l-2 border-white/30 pl-5">
                <p className="text-base sm:text-lg text-white/90 italic leading-relaxed">
                  &ldquo;Learning and teaching chess to our students with the
                  program has been an amazing experience. We have set up our
                  first school chess club this week. It&apos;s great to see the
                  students&apos; critical thinking improve with time!&rdquo;
                </p>
                <footer className="mt-2 text-sm text-white/60">
                  &mdash; Teacher Mr Govinda
                </footer>
              </blockquote>

              <blockquote className="border-l-2 border-white/30 pl-5">
                <p className="text-base sm:text-lg text-white/90 italic leading-relaxed">
                  &ldquo;Chess is the best! I play with my friends every week
                  more than volleyball now.&rdquo;
                </p>
                <footer className="mt-2 text-sm text-white/60">
                  &mdash; Student in Nepal
                </footer>
              </blockquote>
            </div>
          </motion.div>

          {/* Right: 3 non-overlapping photos */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Top image spans both columns */}
            <div className="col-span-2 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <img
                src={programImages[0].src}
                alt={programImages[0].alt}
                className="w-full h-56 sm:h-64 object-cover"
                loading="lazy"
              />
            </div>

            {/* Bottom row: two images side by side */}
            {programImages.slice(1).map((image) => (
              <div
                key={image.alt}
                className="overflow-hidden rounded-2xl border border-white/20 shadow-lg"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-44 sm:h-52 object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
