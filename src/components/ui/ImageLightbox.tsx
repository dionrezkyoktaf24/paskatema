"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageLightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function ImageLightbox({ images, index, onClose, onPrev, onNext }: ImageLightboxProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev && onPrev();
      if (e.key === "ArrowRight") onNext && onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          key={index}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl w-full rounded-lg bg-white shadow-2xl"
        >
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <Image src={images[index]} alt={`Image ${index + 1}`} fill className="object-cover" />
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow"
          >
            ✕
          </button>

          <button
            aria-label="Previous"
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow"
          >
            ‹
          </button>

          <button
            aria-label="Next"
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow"
          >
            ›
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
