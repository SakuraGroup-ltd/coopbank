"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { FadeIn } from "@/components/about/FadeIn";
import { defaultContactDetails } from "./contact-defaults";

export default function ContactDetails(props: Partial<typeof defaultContactDetails> = {}) {
  const c = { ...defaultContactDetails, ...props };
  const cards = [
    { icon: Phone, label: "Call Us", value: c.phone, href: `tel:${c.phone.replace(/\s+/g, "")}` },
    { icon: Mail, label: "Email Us", value: c.email, href: `mailto:${c.email}` },
    { icon: MapPin, label: "Head Office", value: c.address },
    { icon: Clock, label: "Working Hours", value: c.hours },
  ];
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-2">{c.heading}</h2>
          <p className="text-[#4A5568] mb-8">{c.intro}</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const inner = (
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-[#f4f6f9] p-6 h-full hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#1A8A3A]/10">
                  <Icon size={20} className="text-[#1A8A3A]" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] mb-1">{card.label}</h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed">{card.value}</p>
                </div>
              </div>
            );
            return (
              <FadeIn key={card.label} delay={i * 0.08}>
                {card.href ? <a href={card.href}>{inner}</a> : inner}
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
