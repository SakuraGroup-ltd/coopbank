"use client";

// Public-facing branch shape. Names mirror the legacy Sheet columns so the
// rest of this file barely changes. Now fed from Payload via /studio/branches.
export type ClientBranch = {
  name: string;
  type: string;
  region: string;
  address: string;
  phone: string;
  hours_weekday: string;
  hours_saturday: string;
  maps_url: string;
  photo: string;
  lat: string;
  lng: string;
  is_hq: string;
  coming_soon: string;
  expected_opening: string;
  active: string;
};

// Cheap truth-y string check kept here so we don't depend on /lib/sheets.
const bool = (v?: string): boolean => v === "true" || v === "TRUE" || v === "1";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ChevronDown,
  Navigation,
  Building2,
  Search,
  ExternalLink,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function getBranchStatus(
  weekday?: string
): { label: string; open: boolean } {
  if (!weekday) return { label: "Closed", open: false };

  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const h = now.getHours();
  const m = now.getMinutes();
  const time = h * 60 + m;

  if (day === 0) return { label: "Closed", open: false };

  if (day >= 1 && day <= 5) {
    // Mon-Fri: 8:30 - 16:00
    if (time >= 510 && time < 960) return { label: "Open Today", open: true };
    return { label: "Closed", open: false };
  }

  if (day === 6) {
    // Sat: 8:30 - 13:30
    if (time >= 510 && time < 810) return { label: "Open Today", open: true };
    return { label: "Closed", open: false };
  }

  return { label: "Closed", open: false };
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const heroStats = [
  { value: "8+", label: "Branches" },
  { value: "8", label: "Regions" },
  { value: "100+", label: "Agents" },
];

// activeBranches and comingSoonBranches are computed inside the component

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function BranchesClient({ branches }: { branches: ClientBranch[] }) {
  const activeBranches    = branches.filter((b: ClientBranch) => !bool(b.coming_soon));
  const comingSoonBranches = branches.filter((b: ClientBranch) => bool(b.coming_soon));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  const toggle = (name: string) =>
    setExpandedId((prev) => (prev === name ? null : name));

  return (
    <main className="min-h-screen bg-[#F2F4F8]">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20"
      >
        {/* Pattern background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }} />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">Branches</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + Our Branches
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Find Us Near You
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Visit any of our branches across Tanzania for a personalized banking experience. Our doors are always open for you.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BRANCH CARDS                                                 */}
      {/* ============================================================ */}
      <section ref={cardsRef} className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section heading */}
          <motion.div
            initial="hidden"
            animate={cardsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mb-4 text-3xl font-extrabold tracking-tight text-[#0F3D7A] sm:text-4xl"
            >
              Our Branches
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto max-w-2xl text-lg leading-relaxed text-[#4A5568]"
            >
              Click any branch to expand details, view contact and opening
              hours, and get directions.
            </motion.p>
          </motion.div>

          {/* Search / Filter input */}
          <div className="mx-auto mb-10 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by branch name or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-[#0F3D7A] placeholder-slate-400 shadow-sm outline-none transition-shadow focus:border-[#1A56A0]/40 focus:shadow-md focus:ring-2 focus:ring-[#1A56A0]/10"
              />
            </div>
          </div>

          {/* Active branch cards */}
          {(() => {
            const q = searchQuery.toLowerCase().trim();
            const filteredActive = q
              ? activeBranches.filter(
                  (b) =>
                    b.name.toLowerCase().includes(q) ||
                    b.region.toLowerCase().includes(q) ||
                    b.region.toLowerCase().includes(q)
                )
              : activeBranches;

            const filteredComingSoon = q
              ? comingSoonBranches.filter(
                  (b) =>
                    b.name.toLowerCase().includes(q) ||
                    b.region.toLowerCase().includes(q) ||
                    b.region.toLowerCase().includes(q)
                )
              : comingSoonBranches;

            return (
              <>
                <motion.div
                  initial="hidden"
                  animate={cardsInView ? "visible" : "hidden"}
                  variants={staggerContainer}
                  className="grid gap-6 sm:grid-cols-2"
                >
                  {filteredActive.map((branch: ClientBranch, i: number) => {
                    const isOpen = expandedId === branch.name;
                    const status = getBranchStatus(branch.hours_weekday || undefined);
                    const mapsQuery = encodeURIComponent(
                      branch.address
                        ? `${branch.name}, ${branch.address}`
                        : `${branch.name}, ${branch.region}, Tanzania`
                    );
                    // Prefer the maps link saved in the Studio; synthesise a
                    // search URL only when the editor left it blank.
                    const mapsUrl = branch.maps_url?.trim()
                      ? branch.maps_url
                      : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

                    return (
                      <motion.div
                        key={branch.name}
                        variants={fadeUp}
                        custom={i}
                        className={`group rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg ${
                          bool(branch.is_hq)
                            ? "border-[#1A56A0]/30 ring-2 ring-[#1A56A0]/10 sm:col-span-2"
                            : "border-slate-200"
                        }`}
                      >
                        {/* Branch exterior photo (set in /studio/branches) */}
                        {branch.photo && (
                          <div className="h-40 w-full overflow-hidden rounded-t-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={branch.photo}
                              alt={branch.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        {/* Header -- clickable */}
                        <button
                          onClick={() => toggle(branch.name)}
                          className="flex w-full items-center justify-between px-6 py-5 text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                bool(branch.is_hq)
                                  ? "bg-[#1A56A0] text-white"
                                  : "bg-[#1A56A0]/10"
                              }`}
                            >
                              <Building2
                                className={`h-5 w-5 ${
                                  bool(branch.is_hq) ? "text-white" : "text-[#1A56A0]"
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-[#0F3D7A]">
                                {branch.name}
                                {bool(branch.is_hq) && (
                                  <span className="ml-2 rounded-full bg-[#1A56A0]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1A56A0]">
                                    Head Office
                                  </span>
                                )}
                              </h3>
                              <p className="mt-0.5 text-sm text-[#4A5568]">
                                {branch.region} Region
                              </p>
                              {/* Operating hours shown directly on card */}
                              {branch.hours_weekday && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#4A5568]">
                                  <Clock className="h-3.5 w-3.5 text-[#1A8A3A]" />
                                  <span>{branch.hours_weekday}</span>
                                  <span className="text-slate-300">|</span>
                                  <span>{branch.hours_saturday}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Map icon link */}
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hidden items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-[#1A56A0] transition-colors hover:bg-[#1A56A0]/10 sm:inline-flex"
                              title="Open in Google Maps"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Map
                            </a>
                            <span
                              className={`hidden rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide sm:inline-block ${
                                status.open
                                  ? "bg-[#00C853]/10 text-[#1A8A3A]"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              {status.label}
                            </span>
                            <motion.span
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="h-5 w-5 text-[#4A5568]" />
                            </motion.span>
                          </div>
                        </button>

                        {/* Expanded details */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                                transition: { duration: 0.4, ease: "easeOut" },
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                                transition: { duration: 0.3, ease: "easeIn" },
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {/* Address */}
                                  {branch.address && (
                                    <div className="flex items-start gap-3">
                                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1A8A3A]" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#4A5568]">
                                          Address
                                        </p>
                                        <p className="mt-1 text-sm leading-relaxed text-[#0F3D7A]">
                                          {branch.address}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Hours */}
                                  {branch.hours_weekday && (
                                    <div className="flex items-start gap-3">
                                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#1A8A3A]" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#4A5568]">
                                          Opening Hours
                                        </p>
                                        <p className="mt-1 text-sm text-[#0F3D7A]">
                                          {branch.hours_weekday}
                                        </p>
                                        <p className="text-sm text-[#0F3D7A]">
                                          {branch.hours_saturday}
                                        </p>
                                        <p className="text-sm text-[#4A5568]">
                                          Sun: Closed
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Phone */}
                                  {branch.phone && (
                                    <div className="flex items-start gap-3">
                                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#1A8A3A]" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#4A5568]">
                                          Phone
                                        </p>
                                        <a
                                          href={`tel:${branch.phone.replace(/\s/g, "")}`}
                                          className="mt-1 inline-block text-sm font-medium text-[#1A56A0] hover:underline"
                                        >
                                          {branch.phone}
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {/* Email */}
                                  {true && (
                                    <div className="flex items-start gap-3">
                                      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#1A8A3A]" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#4A5568]">
                                          Email
                                        </p>
                                        <a
                                          href={`mailto:${"info@cbtbank.co.tz"}`}
                                          className="mt-1 inline-block text-sm font-medium text-[#1A56A0] hover:underline"
                                        >
                                          {"info@cbtbank.co.tz"}
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* View on Google Maps button */}
                                <div className="mt-6">
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1A56A0] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0F3D7A]"
                                  >
                                    <Navigation className="h-4 w-4" />
                                    View on Google Maps
                                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {filteredActive.length === 0 && filteredComingSoon.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-[#4A5568]">
                      No branches match your search. Try a different name or region.
                    </p>
                  </div>
                )}

                {/* Coming Soon branch cards */}
                {filteredComingSoon.length > 0 && (
                  <div className="mt-14">
                    <h3 className="mb-2 text-center text-xl font-extrabold tracking-tight text-[#0F3D7A]">
                      Expanding Across Tanzania
                    </h3>
                    <p className="mb-8 text-center text-sm text-[#4A5568]">
                      New branches are on the way. Here is our planned expansion timeline.
                    </p>

                    <motion.div
                      initial="hidden"
                      animate={cardsInView ? "visible" : "hidden"}
                      variants={staggerContainer}
                      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      {filteredComingSoon.map((branch: ClientBranch, i: number) => (
                        <motion.div
                          key={branch.name}
                          variants={fadeUp}
                          custom={i}
                          className="relative rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A56A0]/5">
                              <Building2 className="h-5 w-5 text-[#1A56A0]/50" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#0F3D7A]">
                                {branch.name}
                              </h4>
                              <p className="text-xs text-[#4A5568]">
                                {branch.region} Region
                              </p>
                            </div>
                          </div>
                          {branch.expected_opening && (
                            <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#1A56A0]/5 px-3 py-2">
                              <CalendarClock className="h-3.5 w-3.5 text-[#1A56A0]" />
                              <span className="text-xs font-semibold text-[#1A56A0]">
                                Expected: {branch.expected_opening}
                              </span>
                            </div>
                          )}
                          <span className="absolute right-4 top-4 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                            Coming Soon
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                          */}
      {/* ============================================================ */}
      <section
        ref={ctaRef}
        className="bg-gradient-to-br from-[#0F3D7A] via-[#1A56A0] to-[#0F3D7A] py-24"
      >
        <motion.div
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="mx-auto max-w-3xl px-6 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="mb-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Need Help Finding a Branch?
          </motion.h2>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="tel:+255272754470"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00C853] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#1A8A3A]"
            >
              <Phone className="h-4 w-4" />
              Call Us: +255 27 275 4470
            </a>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Back to Home
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-8 text-sm text-slate-400"
          >
            Cooperative Bank Tanzania Plc.
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}
