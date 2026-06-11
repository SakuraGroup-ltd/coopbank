"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  TYPES & DATA                                                       */
/* ------------------------------------------------------------------ */

interface DigitalChannel {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string;
  detailHref?: string;
  accordions: {
    title: string;
    items: string[];
  }[];
}

const channels: DigitalChannel[] = [
  {
    id: 2,
    slug: "coopesa",
    name: "CoopPesa Mobile App",
    description:
      "A simple, secure and convenient way to access your accounts using your smartphone. Send money, pay bills, buy airtime, apply for digital loans, and manage your finances on the go. Secured with fingerprint and Face ID login, with real-time push notifications for every transaction.",
    image: "/images/products/coopesa-oldman.jpg",
    detailHref: "https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en",
    accordions: [
      {
        title: "FEATURES & BENEFITS",
        items: [
          "Fingerprint & Face ID login",
          "Real-time push notifications",
          "QR code payments (TAN-QR / Lipa Namba)",
          "Cardless ATM withdrawal",
          "Bill payments (LUKU, DAWASA, school fees)",
          "Digital loan application",
          "Account-to-account transfers",
          "Airtime top-up all networks",
        ],
      },
      {
        title: "HOW TO REGISTER",
        items: [
          "Download from Google Play or App Store",
          "Enter your CoopBank account number",
          "Set up PIN and biometric login",
          "Start banking immediately",
        ],
      },
      {
        title: "AVAILABLE SERVICES",
        items: [
          "Balance inquiry",
          "Fund transfers",
          "Bill payments",
          "Airtime purchase",
          "Mini statement",
          "Digital loans",
          "QR payments",
        ],
      },
    ],
  },
  {
    id: 1,
    slug: "coopnet",
    name: "CoopNet Internet Banking",
    description:
      "Enjoy the convenience of banking on your own terms, wherever and whenever. Get real-time balances on your accounts, view and download your account activity, transfer funds, pay bills, manage beneficiaries, and set up standing orders -- all from your browser, 24 hours a day.",
    image: "/images/products/coopnet-lady.jpg",
    detailHref: "/digital-banking/coopnet",
    accordions: [
      {
        title: "FEATURES & BENEFITS",
        items: [
          "24/7 browser access from any device",
          "Bill payments and transfers",
          "Statement downloads (PDF/CSV)",
          "Beneficiary management",
          "Standing orders and scheduled payments",
          "Multi-account view",
        ],
      },
      {
        title: "HOW TO REGISTER",
        items: [
          "Visit any CoopBank branch",
          "Request internet banking activation",
          "Receive login credentials via SMS",
          "Log in at coopnet.coopbank.co.tz",
        ],
      },
      {
        title: "AVAILABLE SERVICES",
        items: [
          "Account management",
          "Fund transfers",
          "Bill payments",
          "Statement downloads",
          "Beneficiary management",
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "ussd",
    name: "USSD *150*84#",
    description:
      "Don't have a smartphone? No problem. Dial *150*84# from any phone -- even a basic feature phone -- and access your account instantly. Check your balance, send money, buy airtime, pay LUKU and DAWASA bills, all without internet. Banking that reaches every Tanzanian, everywhere.",
    image: "/images/USSD.png",
    detailHref: "/digital-banking/ussd",
    accordions: [
      {
        title: "FEATURES & BENEFITS",
        items: [
          "No internet required",
          "Works on all phones including feature phones",
          "Check balance instantly",
          "Send money to any bank",
          "Buy airtime all networks",
          "Pay bills (LUKU, DAWASA, government)",
        ],
      },
      {
        title: "HOW TO REGISTER",
        items: [
          "Dial *150*84# from your registered phone",
          "Follow the prompts to set up your PIN",
          "Start banking immediately",
        ],
      },
      {
        title: "AVAILABLE SERVICES",
        items: [
          "Balance inquiry",
          "Money transfer",
          "Airtime purchase",
          "Bill payments",
          "Mini statement",
        ],
      },
    ],
  },
  {
    id: 4,
    slug: "coopwakala",
    name: "CoopWakala Agency Banking",
    description:
      "Banking has come to your doorstep. With over 100 CoopWakala agents spread across Tanzania, you can deposit cash, withdraw funds, pay bills, and even open an account -- right in your neighbourhood. No branch visit needed. Extended hours mean you can bank when it suits you, not when the bank is open.",
    image: "/images/products/coopwakala.jpg",
    detailHref: "/digital-banking/coopwakala",
    accordions: [
      {
        title: "FEATURES & BENEFITS",
        items: [
          "Deposits and withdrawals",
          "Cash-in and cash-out services",
          "Bill payments through agents",
          "Account opening assistance",
          "Available in rural and urban areas",
          "Extended operating hours",
        ],
      },
      {
        title: "HOW TO REGISTER",
        items: [
          "Visit any CoopWakala agent with your ID",
          "Link your CoopBank account",
          "Start transacting through the agent",
        ],
      },
      {
        title: "AVAILABLE SERVICES",
        items: [
          "Cash deposits",
          "Cash withdrawals",
          "Bill payments",
          "Balance inquiry",
          "Account opening",
        ],
      },
    ],
  },
  /* Visa and TAN-QR moved to Cards & Payments page */
];

/* ------------------------------------------------------------------ */
/*  REUSABLE ANIMATED SECTION WRAPPER                                  */
/* ------------------------------------------------------------------ */

function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ACCORDION PANEL                                                    */
/* ------------------------------------------------------------------ */

function AccordionPanel({
  title,
  items,
  isOpen,
  onToggle,
}: {
  title: string;
  items: string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none group/acc"
      >
        <span
          className={`text-sm font-bold tracking-wide uppercase transition-colors duration-200 ${
            isOpen ? "text-[#1A8A3A]" : "text-[#1A56A0]"
          }`}
        >
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`transition-colors duration-200 ${
            isOpen ? "text-[#1A8A3A]" : "text-[#1A56A0]/50"
          }`}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="pb-5 space-y-3">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A8A3A]/10 flex items-center justify-center mt-0.5">
                    <Check size={12} className="text-[#1A8A3A]" />
                  </span>
                  <span className="text-[#4A5568] text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHANNEL DETAIL SECTION (zigzag)                                    */
/* ------------------------------------------------------------------ */

function ChannelDetailSection({
  channel,
  index,
}: {
  channel: DigitalChannel;
  index: number;
}) {
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const isEven = index % 2 === 1;
  const bgColor = index % 2 === 0 ? "bg-white" : "bg-[#f4f6f9]";

  const togglePanel = (panel: string) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  const textContent = (
    <FadeInSection className="flex flex-col justify-center" delay={0.1}>
      {/* Channel name */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
        {channel.name}
      </h2>

      {/* Description */}
      <p className="text-[#4A5568] text-base leading-relaxed mb-8">
        {channel.description}
      </p>

      {/* Button */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link
          href={channel.detailHref || "#"}
          target={channel.detailHref?.startsWith("http") ? "_blank" : undefined}
          rel={channel.detailHref?.startsWith("http") ? "noopener" : undefined}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors duration-300"
        >
          {channel.slug === "coopesa" ? "Download App" : "Learn More"}
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Accordion panels - only for channels that need depth */}
      {channel.slug === "coopesa" && (
        <div className="border-t border-gray-200">
          {channel.accordions.filter(a => a.title === "FEATURES & BENEFITS").map((accordion) => (
            <AccordionPanel
              key={accordion.title}
              title={accordion.title}
              items={accordion.items}
              isOpen={openPanel === accordion.title}
              onToggle={() => togglePanel(accordion.title)}
            />
          ))}
        </div>
      )}

    </FadeInSection>
  );

  const isPng = channel.image.endsWith(".png");
  const imageContent = (
    <FadeInSection className="flex items-center justify-center" delay={0.2}>
      {isPng ? (
        <Image
          src={channel.image}
          alt={channel.name}
          width={500}
          height={500}
          className="w-full h-auto max-w-md"
        />
      ) : (
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={channel.image}
            alt={channel.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
    </FadeInSection>
  );

  return (
    <section
      id={channel.slug}
      className={`${bgColor} py-20 sm:py-24 lg:py-28 scroll-mt-20`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {isEven ? (
            <>
              {imageContent}
              {textContent}
            </>
          ) : (
            <>
              {textContent}
              {imageContent}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function DigitalBankingPage() {
  return (
    <>
      {/* ============================================================ */}
      {/*  HERO BANNER                                                 */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        {/* Pattern background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/pattern-bg.jpg')",
            backgroundSize: "1200px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">Digital Banking</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + Digital Banking
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Banking Made Simple, Anytime Anywhere
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            Pay bills, transfer funds, and manage your finances seamlessly with
            CoopNet, CoopPesa, USSD and more.
          </motion.p>


        </div>
      </section>

      {/* ============================================================ */}
      {/*  CHANNEL DETAIL SECTIONS (zigzag)                            */}
      {/* ============================================================ */}
      {[...channels].sort((a, b) => a.id - b.id).map((channel, i) => (
        <ChannelDetailSection key={channel.id} channel={channel} index={i} />
      ))}

      {/* ============================================================ */}
      {/*  BOTTOM CTA -- Download CoopPesa (centered rounded card)       */}
      {/* ============================================================ */}
      <section className="bg-white pt-20 sm:pt-24 pb-0 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 pb-20 sm:pb-24 relative">
          {/* Phone floating above the card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block absolute right-28 -top-8 -bottom-8 z-20 flex items-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/coopesa-mockup.png"
                alt="CoopPesa Mobile App"
                width={200}
                height={400}
                className="drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl bg-[#1A56A0] px-8 py-10 sm:px-16 sm:py-12 overflow-hidden"
          >
            {/* Pattern background inside card */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }} />
            <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none rounded-3xl" />

            <div className="relative z-10 max-w-md">
              <Download className="mb-4 text-[#00C853]" size={36} />
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Get CoopPesa on Your Phone
              </h2>
              <p className="mt-3 text-base text-white/50 leading-relaxed">
                Join over 50,000 Tanzanians who bank smarter every day. Send money, pay bills, apply for loans, and manage your finances -- all from one app.
              </p>
              {/* App store buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en" target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92ZM14.835 13.043l2.458 1.433-2.458 1.433L5.34 21.65l9.495-8.607Zm0-2.086L5.34 2.35l9.495 5.741 2.458 1.433-2.458 1.433ZM18.244 15l2.102-1.227a1.003 1.003 0 0 0 0-1.546L18.244 11l-2.73 2 2.73 2Z" />
                  </svg>
                  Google Play
                </a>
                <a
                  href="https://apps.apple.com/tz/app/coopesa/id6755827543" target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                  </svg>
                  App Store
                </a>
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
