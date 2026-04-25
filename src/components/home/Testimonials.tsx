"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Cooperative Bank has been my trusted partner for over ten years. Their Mama Africa Account helped me grow my tailoring business from a small shop to three branches across Arusha.",
    name: "Neema Mwakasege",
    role: "Entrepreneur, Arusha",
    stars: 5,
  },
  {
    quote:
      "The CoopEsa mobile app makes it so easy to manage my farm finances. I can receive payments, send money, and even apply for loans right from my phone in the village.",
    name: "Joseph Kimaro",
    role: "Farmer, Kilimanjaro",
    stars: 5,
  },
  {
    quote:
      "As a cooperative society chairman, I appreciate how Cooperative Bank truly understands community banking. Their agency network reaches even the most remote areas of our region.",
    name: "Amina Salum",
    role: "SACCOS Chairman, Dodoma",
    stars: 5,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-gray-bg py-[var(--section-padding)]">
      <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-xl text-center"
        >
          <h2 className="text-3xl font-bold text-navy sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-gray-body">
            Real stories from people we are proud to serve
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star
                    key={s}
                    className="h-4 w-4 fill-green-accent text-green-accent"
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-gray-body">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-sm font-bold text-navy">{t.name}</p>
                <p className="mt-0.5 text-xs text-gray-body">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
