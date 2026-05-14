"use client";

import { Phone, MessageCircle, Mail } from "lucide-react";
import { FadeInSection } from "./TreasuryFadeIn";

interface Dealer {
  name: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  email?: string;
}

const DEALERS: Dealer[] = [
  {
    name: "Hamis C. Mwita",
    phone: "+255 766 722 201",
    phoneRaw: "+255766722201",
    whatsapp: "255766722201",
    email: "treasury@coopbank.co.tz",
  },
  {
    name: "Valentino I. Hungu",
    phone: "+255 756 401 135",
    phoneRaw: "+255756401135",
    whatsapp: "255756401135",
    email: "treasury@coopbank.co.tz",
  },
];

export function TreasuryDeskContact() {
  return (
    <section className="bg-[#1A1A2E] py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <FadeInSection className="text-center mb-12">
          <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white mb-5">
            + Contact our dealers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Speak directly with our Treasury Desk
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            For competitive quotes, structuring advice, or to execute a trade, contact our
            Treasury dealers during business hours, Monday to Friday.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {DEALERS.map((d, i) => (
            <FadeInSection key={d.name} delay={i * 0.1}>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.06] transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00C853] mb-3">
                  Treasury Dealer
                </p>
                <h3 className="text-xl font-bold text-white mb-5">{d.name}</h3>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${d.phoneRaw}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-xs transition-colors"
                  >
                    <Phone size={14} />
                    {d.phone}
                  </a>
                  <a
                    href={`https://wa.me/${d.whatsapp}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                  {d.email && (
                    <a
                      href={`mailto:${d.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                    >
                      <Mail size={14} />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection className="text-center mt-10" delay={0.2}>
          <p className="text-white/40 text-xs">
            Business hours: Monday – Friday, 8:30 AM – 4:00 PM EAT
          </p>
        </FadeInSection>
      </div>
    </section>
  );
}
