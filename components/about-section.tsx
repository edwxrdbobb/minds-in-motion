"use client";

import { motion } from "framer-motion";
import { MapPin, Users, BookOpen } from "lucide-react";
import { Boxes } from "@/components/ui/background-tiles";
import { images } from "@/lib/cloudinary";

const highlights = [
  {
    icon: BookOpen,
    title: "School Chess Clubs",
    description: "Establishing chess programs in underprivileged schools",
  },
  {
    icon: Users,
    title: "Coach Training",
    description: "Training local educators to sustain programs long-term",
  },
  {
    icon: MapPin,
    title: "Global Reach",
    description: "Active in Nepal and Ghana with plans to expand",
  },
];

export function AboutSection() {
  return ( 
    <section id="about" className="relative py-24 overflow-hidden bg-white">
      {/* Background boxes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <Boxes />
      </div>
      
      {/* Gradient fade overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-100 to-gray-100/80 z-[1]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-600/10 border border-gray-800/20 mb-6">
              <span className="text-sm text-gray-700">Who We Are</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-balance">
              About <span className="text-gray-500">Minds in Motion</span>
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Minds in Motion is a nonprofit organization dedicated to empowering
                youth through the game of chess. We believe that chess is more than
                just a game—it&apos;s a tool for building critical thinking,
                patience, and strategic planning skills.
              </p>
              <p>
                Founded with a mission to bring chess education to underserved
                communities, we work in Nepal and Ghana to provide chessboards,
                training, and ongoing support to schools and community centers.
                Our programs focus on sustainable impact by training local coaches
                who continue to teach long after our direct involvement.
              </p>
            </div>

            {/* Highlights */}
            <div className="mt-8 space-y-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600">{item.title}</h3>
                    <p className="text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Card with Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-2xl" />
              
              {/* Image collage */}
              <div className="relative bg-white/10 backdrop-blur-sm border border-gray-200/20 shadow-sm rounded-3xl p-4 overflow-hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 overflow-hidden rounded-2xl">
                    <img
                      src={images["SnapInsta.to_693988552_18098778568914914_6229337764024885964_n"]}
                      alt="Children with chessboards"
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={images["682105336_18094481158914914_7793339273851575831_n"]}
                      alt="Nepal chess program"
                      className="w-full h-36 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={images["SnapInsta.to_683602965_18095464537914914_8037810932371650682_n"]}
                      alt="Children playing chess"
                      className="w-full h-36 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <blockquote className="text-lg text-gray-600 italic border-l-2 border-gray-400 pl-4">
                    &quot;Every move on the chessboard teaches a lesson for life—
                    patience, foresight, and the courage to take calculated
                    risks.&quot;
                  </blockquote>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-gray-600">Nepal</div>
                      <div className="text-sm text-gray-400">
                        Active Region
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-gray-600">Ghana</div>
                      <div className="text-sm text-slate-400">
                        Active Region
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
