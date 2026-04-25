"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Wallet, Landmark, Sprout, Building2, ShieldCheck,
  Users, Heart, Briefcase, Smartphone, Tractor, Car,
  Store, Truck, PiggyBank, GraduationCap,
} from "lucide-react";

/* ───── Tab Data: Real CoopBank Products ───── */

type TabProduct = {
  name: string;
  desc: string;
  icon: React.ReactNode;
};

type Tab = {
  label: string;
  products: TabProduct[];
};

const tabs: Tab[] = [
  {
    label: "Accounts & Deposits",
    products: [
      { name: "Mama Africa Account", desc: "Everyday savings for all Tanzanians", icon: <Heart size={20} /> },
      { name: "Baba Fedha Account", desc: "Family financial planning", icon: <Landmark size={20} /> },
      { name: "Kilimo Tija Account", desc: "Agricultural savings account", icon: <Sprout size={20} /> },
      { name: "Jasiri Account", desc: "Youth empowerment (18-35)", icon: <GraduationCap size={20} /> },
      { name: "Group Accounts", desc: "SACCOs, Vikoba & Chamas", icon: <Users size={20} /> },
      { name: "Current Account", desc: "Unlimited daily transactions", icon: <Building2 size={20} /> },
      { name: "Fixed Deposit Account", desc: "Up to 10% p.a. interest", icon: <ShieldCheck size={20} /> },
      { name: "Investment Account", desc: "Higher-yield savings", icon: <PiggyBank size={20} /> },
      { name: "Msomi Account", desc: "No monthly fees", icon: <GraduationCap size={20} /> },
    ],
  },
  {
    label: "Cards & Digital",
    products: [
      { name: "Visa Debit Card", desc: "Shop locally and internationally", icon: <Wallet size={20} /> },
      { name: "CoopEsa Mobile App", desc: "Bank from your phone 24/7", icon: <Smartphone size={20} /> },
      { name: "Internet Banking", desc: "Manage accounts online", icon: <Landmark size={20} /> },
      { name: "USSD Banking *150*86#", desc: "Bank without internet", icon: <Smartphone size={20} /> },
      { name: "Agent Banking", desc: "Bank at your nearest agent", icon: <Store size={20} /> },
      { name: "Lipa Namba", desc: "Pay merchants with your phone", icon: <Wallet size={20} /> },
    ],
  },
  {
    label: "Loans",
    products: [
      { name: "Agri-Business Loans", desc: "TSH 100K-50M for farmers", icon: <Tractor size={20} /> },
      { name: "SME Loans", desc: "Grow your medium enterprise", icon: <Briefcase size={20} /> },
      { name: "Salaried Loans", desc: "For employed individuals", icon: <PiggyBank size={20} /> },
      { name: "Asset Financing", desc: "Vehicles and equipment", icon: <Car size={20} /> },
      { name: "Bajaji Loans", desc: "Transport business finance", icon: <Truck size={20} /> },
      { name: "Digital Loans", desc: "Instant via CoopEsa app", icon: <Smartphone size={20} /> },
      { name: "Bunge Loans", desc: "Group lending power", icon: <Users size={20} /> },
      { name: "Business Loans", desc: "For corporates & large enterprises", icon: <Building2 size={20} /> },
      { name: "MSE Loans", desc: "For small businesses", icon: <Store size={20} /> },
    ],
  },
];

/* ───── Showcase Cards (dark carousel with real products) ───── */

type ShowcaseCard = {
  title: string;
  bullets: string[];
  image: string;
};

const showcaseCards: ShowcaseCard[] = [
  {
    title: "Mama Africa Account",
    bullets: ["Everyday savings for all Tanzanians", "Low opening balance from TSH 10,000", "Free CoopEsa mobile banking"],
    image: "/images/products/mama-africa.jpg",
  },
  {
    title: "Kilimo Tija Account",
    bullets: ["Designed for Tanzanian farmers", "Seasonal deposit flexibility", "Access to agri-business loans"],
    image: "/images/products/kilimo-tija.jpg",
  },
  {
    title: "Jasiri Account",
    bullets: ["Youth empowerment (18-35)", "Zero account opening balance", "Business mentorship access"],
    image: "/images/products/jasiri.jpg",
  },
  {
    title: "Fixed Deposit Account",
    bullets: ["Up to 10% p.a. interest", "Flexible tenure from 3 months", "Capital protection guaranteed"],
    image: "/images/products/fixed-deposit.jpg",
  },
  {
    title: "Msomi Account",
    bullets: ["No monthly fees", "Free debit card", "Financial literacy training"],
    image: "/images/products/wanafunzi.jpg",
  },
  {
    title: "Group Accounts",
    bullets: ["For SACCOs, Vikoba & Chamas", "Joint account management", "Group loan access"],
    image: "/images/products/group.jpg",
  },
  {
    title: "CoopEsa Mobile",
    bullets: ["Send money instantly", "Pay bills and buy airtime", "Apply for digital loans"],
    image: "/images/products/coopesa.jpg",
  },
  {
    title: "Visa Debit Card",
    bullets: ["Accepted locally and internationally", "Secure online shopping", "Free with qualifying accounts"],
    image: "/images/products/visa-debit.jpg",
  },
  {
    title: "Agri-Business Loans",
    bullets: ["TSH 100K to 50M financing", "Up to 3 years repayment", "Grace period available"],
    image: "/images/products/agri-business.jpg",
  },
  {
    title: "SME Loans",
    bullets: ["Flexible repayment terms", "Free SME Hub membership", "Access to business advisory"],
    image: "/images/products/sme-loans.jpg",
  },
];

export default function ProductsCarousel() {
  const [activeTab, setActiveTab] = useState(0);
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
            {showcaseCards.map((card, i) => (
              <motion.div
                key={card.title}
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
                    href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en" target="_blank" rel="noopener"
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
