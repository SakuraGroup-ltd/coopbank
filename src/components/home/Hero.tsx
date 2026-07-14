"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { defaultHeroSlides, type HeroSlide } from "./home-defaults";

export default function Hero({ slides = defaultHeroSlides }: { slides?: HeroSlide[] }) {
  if (!slides.length) slides = defaultHeroSlides;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center 15%" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays — blue-green gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F3D7A]/75 via-[#1A56A0]/50 to-[#1A8A3A]/20 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D7A]/50 via-transparent to-[#1A56A0]/15 z-[1]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1440px] flex-col justify-center px-6 pt-20 sm:px-12 lg:pt-24">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-4 text-sm font-semibold tracking-widest text-[#00C853] uppercase">
                {slide.tagline}
              </p>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.1]">
                {slide.headline}
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
                {slide.desc}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={slide.cta1.href}
                  className="inline-flex items-center justify-center rounded-lg bg-[#1A8A3A] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#00C853]"
                >
                  {slide.cta1.label}
                </a>
                <a
                  href={slide.cta2.href}
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {slide.cta2.label}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-6 sm:left-12 flex items-center gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative h-2 overflow-hidden rounded-full transition-all duration-300"
              style={{ width: i === current ? 40 : 12 }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full" />
              {i === current && (
                <motion.div
                  className="absolute inset-0 bg-[#00C853] rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
