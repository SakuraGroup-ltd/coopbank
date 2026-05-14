"use client";

import { Phone, MessageCircle } from "lucide-react";
import { FadeInSection } from "./TreasuryFadeIn";

interface Dealer {
  name: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
}

const DEALERS: Dealer[] = [
  {
    name: "Hamis C. Mwita",
    phone: "+255 766 722 201",
    phoneRaw: "+255766722201",
    whatsapp: "255766722201",
  },
  {
    name: "Valentino I. Hungu",
    phone: "+255 756 401 135",
    phoneRaw: "+255756401135",
    whatsapp: "255756401135",
  },
];

export function TreasuryDeskContact() {
  return (
    <section id="contact" className="bg-[#f4f6f9] py-12 sm:py-14 scroll-mt-24 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-14 items-center">
          <FadeInSection>
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A8A3A] mb-3">
              Treasury Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A56A0] leading-tight mb-3">
              Speak directly with our dealers
            </h2>
            <p className="text-gray-500 text-xs">
              Mon – Fri &middot; 8:30 AM – 4:00 PM EAT
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEALERS.map((d, i) => (
              <FadeInSection key={d.name} delay={i * 0.05}>
                <div className="group relative bg-white hover:shadow-md border border-gray-200 rounded-xl p-5 transition-shadow overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-[#1A8A3A] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1.5">
                    Dealer
                  </p>
                  <h3 className="text-[15px] font-bold text-[#1A56A0] mb-4">{d.name}</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${d.phoneRaw}`}
                      className="inline-flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white text-xs font-semibold transition-colors"
                    >
                      <Phone size={13} />
                      <span className="font-mono">{d.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${d.whatsapp}`}
                      target="_blank"
                      rel="noopener"
                      aria-label={`WhatsApp ${d.name}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#1A8A3A]/10 hover:bg-[#1A8A3A]/20 text-[#1A8A3A] transition-colors"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
