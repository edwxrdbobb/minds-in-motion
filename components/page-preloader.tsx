"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { images } from "@/lib/cloudinary";

// Lets other components (e.g. on-page counters) wait until the splash has
// actually finished, since they mount underneath it and would otherwise run
// their entrance animations while still hidden behind the overlay.
export const PAGE_PRELOADER_DONE_EVENT = "page-preloader-done";
let pagePreloaderDone = false;
export function isPagePreloaderDone() {
  return pagePreloaderDone;
}

export function PagePreloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1400));

    const globeReady = new Promise<void>((resolve) => {
      window.addEventListener("globe-ready", () => resolve(), { once: true });
      // Fallback: hide after 6s regardless
      setTimeout(resolve, 6000);
    });

    Promise.all([minDelay, globeReady]).then(() => {
      pagePreloaderDone = true;
      window.dispatchEvent(new Event(PAGE_PRELOADER_DONE_EVENT));
      setVisible(false);
    });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#080808", pointerEvents: "none" }}
        >
          {/* Subtle chessboard grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Radial vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, #080808 100%)",
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={images.logo}
                alt="Minds in Motion"
                className="w-16 h-16 rounded-2xl object-cover"
              />
            </motion.div>

            {/* Brand name */}
            <div className="text-center">
              <p className="text-white/80 text-sm font-semibold tracking-[0.22em] uppercase">
                Minds in Motion
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2 mt-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/40"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
