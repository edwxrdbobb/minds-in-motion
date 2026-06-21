"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { images } from "@/lib/cloudinary";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-background" />
      <div className="absolute inset-0 chessboard-bg opacity-10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex items-center justify-center w-10 h-10">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                <img
                  src={images.logo}
                  alt="Minds in Motion"
                  className="relative w-10 h-10 rounded-lg object-cover"
                />
              </div>
              <span className="text-xl font-bold text-foreground">
                Minds in Motion
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Empowering communities through the game of chess. Building minds,
              one move at a time.
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <a
              href="https://instagram.com/minds.in.motion.global"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary/70 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-sm">@minds.in.motion.global</span>
            </a>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8"
          />

          {/* Copyright and credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-3 text-center"
          >
            <p className="text-sm text-muted-foreground">
              © {currentYear} Minds in Motion. All rights reserved.
            </p>

          </motion.div>
        </div>
      </div>
    </footer>
  );
}
