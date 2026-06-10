"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowLeft, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { images } from "@/lib/cloudinary";

const galleryImages = [
  { src: images["682105336_18094481158914914_7793339273851575831_n"], alt: "Nepal chess program" },
  { src: images["SnapInsta.to_683602965_18095464537914914_8037810932371650682_n"], alt: "Children playing chess" },
  { src: images["SnapInsta.to_684518500_18096565441914914_7294225183507457160_n"], alt: "Community chess event" },
  { src: images["SnapInsta.to_683546295_18096565306914914_3057388858046939129_n"], alt: "Chess workshop" },
  { src: images["SnapInsta.to_693988552_18098778568914914_6229337764024885964_n"], alt: "Kids with chessboards" },
  { src: images["SnapInsta.to_685691170_18096565252914914_7178199717492455235_n"], alt: "Chess lesson in progress" },
  { src: images["SnapInsta.to_687434873_18098059855914914_1359652674294065630_n"], alt: "Group photo with students" },
  { src: images["SnapInsta.to_686522107_18098059801914914_5780465278133543135_n"], alt: "Chess tournament" },
  { src: images["SnapInsta.to_685167495_18098059732914914_2060923157242809560_n"], alt: "Volunteers teaching chess" },
  { src: images["SnapInsta.to_688208931_18098877589914914_7714795630826850058_n"], alt: "School chess club" },
  { src: images["SnapInsta.to_670882656_18098877553914914_8322753557978272293_n"], alt: "Chess outreach" },
  { src: images["SnapInsta.to_685129054_18098059681914914_2667089746401724705_n"], alt: "Community event" },
  { src: images["SnapInsta.to_685929804_18098059915914914_3282036877542199232_n"], alt: "Youth chess players" },
  { src: images["SnapInsta.to_686062586_18098137276914914_9036265106905470371_n"], alt: "Chess education" },
  { src: images["SnapInsta.to_688306098_18096565534914914_6900213200719871838_n"], alt: "Team activity" },
  { src: images["SnapInsta.to_689234115_18099211525914914_2814877204091254826_n"], alt: "Student engagement" },
  { src: images["SnapInsta.to_700129669_18099895939914914_6692483748464565555_n"], alt: "Outdoor chess activity" },
  { src: images["SnapInsta.to_700369184_18099895960914914_4933560801340100531_n"], alt: "Chess program event" },
  { src: images["SnapInsta.to_701056196_18100272046914914_5133821505680413122_n"], alt: "Community chess day" },
  { src: images["SnapInsta.to_702846988_18100272073914914_1983981930647492114_n"], alt: "Community gathering" },
];

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % galleryImages.length);
    }
  };
  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return;
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "Escape") closeLightbox();
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Button asChild variant="ghost" className="text-gray-700 gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
               <img
                src={images.logo}
                alt="Minds in Motion"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-sm font-semibold text-gray-900">
                Minds in Motion
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-6">
            <ImageIcon className="w-4 h-4 text-gray-900" />
            <span className="text-sm text-gray-600">
              {galleryImages.length} Photos
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through moments captured from our chess programs across Nepal
            and Ghana. Click any photo to view it in full size.
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryImages.map((image, index) => (
            <motion.button
              key={image.src}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              onClick={() => openLightbox(index)}
              className="break-inside-avoid group relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {image.alt}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.img
              key={galleryImages[selectedIndex].src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={galleryImages[selectedIndex].src}
              alt={galleryImages[selectedIndex].alt}
              className="max-h-[85vh] max-w-full object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <span className="text-white/90 text-sm font-medium">
                {galleryImages[selectedIndex].alt}
              </span>
              <span className="text-white/50 text-xs">
                {selectedIndex + 1} / {galleryImages.length} · Use arrow keys to
                navigate
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
