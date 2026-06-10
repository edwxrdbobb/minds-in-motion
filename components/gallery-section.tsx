"use client";

import { motion } from "framer-motion";
import { ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { images } from "@/lib/cloudinary";
import { FallingPattern } from "@/components/ui/falling-pattern";

const previewImages = [
  { src: images["682105336_18094481158914914_7793339273851575831_n"], alt: "Nepal chess program" },
  { src: images["SnapInsta.to_683602965_18095464537914914_8037810932371650682_n"], alt: "Children playing chess" },
  { src: images["SnapInsta.to_684518500_18096565441914914_7294225183507457160_n"], alt: "Community chess event" },
  { src: images["SnapInsta.to_683546295_18096565306914914_3057388858046939129_n"], alt: "Chess workshop" },
  { src: images["SnapInsta.to_693988552_18098778568914914_6229337764024885964_n"], alt: "Kids with chessboards" },
  { src: images["SnapInsta.to_685691170_18096565252914914_7178199717492455235_n"], alt: "Chess lesson in progress" },
];

export function GallerySection() {
  return (
    <section id="gallery" className="relative py-24 overflow-hidden bg-black min-h-screen">
      <div className="absolute inset-0">
        <FallingPattern color="rgba(255,255,255,0.35)" backgroundColor="#000000" duration={150} blurIntensity="1em" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <ImageIcon className="w-4 h-4 text-white" />
            <span className="text-sm text-white/80">Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our Gallery
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Moments captured from our programs across Nepal and Ghana
          </p>
        </motion.div>

        {/* 6-photo preview grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {previewImages.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-44 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  {image.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* See More button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white hover:text-black group"
          >
            <Link href="/gallery">
              See More Photos
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
