"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ShowcaseCard } from "./showcase-data";

export type { ShowcaseCard } from "./showcase-data";

// Pure presentational half of the homepage dark carousel — driven entirely by
// props so the live site, the studio live-preview, and the fallback content
// all render through the exact same markup.
export function ProductsCarouselView({ cards }: { cards: ShowcaseCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) { setProgress(0); return; }
    setProgress((el.scrollLeft / max) * 100);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => el.removeEventListener("scroll", updateProgress);
  }, [updateProgress]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector('div')?.offsetWidth ?? 280;
    const scrollAmount = cardWidth + 24; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Auto-scroll every 4 seconds, pause on hover
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let paused = false;
    const timer = setInterval(() => {
      if (paused) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cardEl = el.querySelector('div');
        const step = cardEl ? cardEl.offsetWidth + 24 : 320;
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    return () => {
      clearInterval(timer);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <>
      {/* ━━━ Dark Showcase Carousel ━━━ */}
      <section ref={sectionRef} className="bg-[#0F3D7A] py-20">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-12">
          {/* Carousel */}
          <div
            ref={scrollRef}
            className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pb-6"
          >
            {cards.map((card, i) => (
              <motion.div
                key={`${card.title}-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-2xl lg:w-[calc(25%-18px)]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-[380px] w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl font-bold text-white">{card.title}</h3>
                  <ul className="mt-2 space-y-0.5">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-1.5 text-[13px] font-medium leading-snug text-gray-200">
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={card.href}
                    {...(/^https?:\/\//.test(card.href) ? { target: "_blank", rel: "noopener" } : {})}
                    className="mt-4 inline-block rounded-md bg-[#1A8A3A] px-3.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#14692D]"
                  >
                    EXPLORE
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress bar - tracks scroll position */}
          <div className="relative mt-8 h-[4px] rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[#1A8A3A] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>

          {/* Bottom: text + arrows */}
          <div className="mt-10 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                We have the right account for every banking need
              </h2>
              <p className="mt-3 text-gray-400">
                Our services are powered by the latest technology, and our people are friendly and committed to delivering exceptional customer service.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
