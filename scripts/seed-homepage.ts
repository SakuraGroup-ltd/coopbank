/**
 * Replace the placeholder Home Page with a real block composition that mirrors
 * what dev.coopbank.co.tz currently renders from hand-coded React.
 *
 * Run: npm run seed:homepage
 *
 * Idempotent — deletes any existing Page with slug=home before recreating.
 * Run AFTER `npm run seed:assets` so Media is populated (slide images are
 * resolved by filename → Media doc id).
 */
import { getPayload } from "payload";
import config from "../payload.config";

async function mediaIdByName(payload: Awaited<ReturnType<typeof getPayload>>, name: string) {
  const r = await payload.find({
    collection: "media",
    where: { filename: { equals: name } },
    limit: 1,
  });
  if (!r.docs[0]) console.warn(`[homepage] WARN missing media: ${name}`);
  return r.docs[0]?.id;
}

async function main() {
  const payload = await getPayload({ config });

  // Look up the upload IDs once. If any are missing the block will still save
  // (slides validate image as relation but Payload allows null; admin can fix).
  const [heroPresident, heroFarming, coopnetLady, coopesaMockup] = await Promise.all([
    mediaIdByName(payload, "hero-president.jpg"),
    mediaIdByName(payload, "hero-farming.jpg"),
    mediaIdByName(payload, "coopnet-lady.jpg"),
    mediaIdByName(payload, "coopesa-mockup.png"),
  ]);

  // Drop the placeholder home so we recreate cleanly
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
    draft: true,
  });
  if (existing.docs[0]) {
    await payload.delete({ collection: "pages", id: existing.docs[0].id });
    console.log("[homepage] removed placeholder home");
  }

  await payload.create({
    collection: "pages",
    data: {
      title: "Home",
      slug: "home",
      seo: {
        metaTitle: "Cooperative Bank Tanzania — Trusted by the Nation",
        metaDescription:
          "From farmers to entrepreneurs, CoopBank serves over 2 million customers with financial solutions that uplift communities across Tanzania.",
      },
      layout: [
        // ── 1. Hero slider ────────────────────────────────────────────
        {
          blockType: "media-slider",
          autoplay: true,
          intervalSeconds: 6,
          slides: [
            heroPresident && {
              image: heroPresident,
              eyebrow: "Benki ya Ushirikiano",
              headline: "Trusted by the Nation, Built for Every Tanzanian",
              subhead:
                "From farmers to entrepreneurs, CoopBank serves over 2 million customers with financial solutions that uplift communities.",
              ctaLabel: "About Us",
              ctaHref: "/about-us",
            },
            heroFarming && {
              image: heroFarming,
              eyebrow: "Ustawi kwa wote",
              headline: "Empowering Communities Through Cooperative Banking",
              subhead:
                "Accessible financial services for individuals, businesses, and communities across Tanzania.",
              ctaLabel: "Open an Account",
              ctaHref: "/open-account",
            },
            coopnetLady && {
              image: coopnetLady,
              eyebrow: "Benki Yako Mkononi",
              headline: "Digital Banking, Designed for You",
              subhead:
                "Manage your finances anytime, anywhere. Mobile banking, instant transfers, and secure payments at your fingertips.",
              ctaLabel: "Mobile Banking",
              ctaHref: "/digital-banking",
            },
          ].filter(Boolean),
        },

        // ── 2. Quick links grid ───────────────────────────────────────
        {
          blockType: "product-grid",
          heading: "Bank Your Way",
          subhead: "Everything you need, in one place.",
          columns: "3",
          tiles: [
            { title: "Savings & Current", description: "Personal accounts to suit every life stage.", icon: "PiggyBank", href: "/personal-banking" },
            { title: "Debit Cards", description: "Visa cards for everyday spending.", icon: "CreditCard", href: "/cards" },
            { title: "Personal Loans", description: "Payroll-linked loans, fast approval.", icon: "Banknote", href: "/loan-products#salaried" },
            { title: "Agri Loans", description: "TSH 100K-50M, built for farmers.", icon: "Tractor", href: "/loan-products#agri-business" },
            { title: "Mobile Banking", description: "Bank from your phone with CoopPesa.", icon: "Smartphone", href: "/digital-banking#coopesa" },
            { title: "Agency Banking", description: "100+ CoopWakala agents nationwide.", icon: "Store", href: "/digital-banking#coopwakala" },
            { title: "Treasury & Forex", description: "Daily FX rates, fixed deposits, T-bills.", icon: "Globe", href: "/treasury/foreign-exchange" },
            { title: "Loan Calculator", description: "Estimate your repayments in seconds.", icon: "Calculator", href: "/loan-products/calculator" },
            { title: "Branches & ATMs", description: "Find your nearest CoopBank location.", icon: "MapPin", href: "/branches" },
          ],
        },

        // ── 3. Stats strip ────────────────────────────────────────────
        {
          blockType: "stats",
          heading: "Built for Tanzania",
          stats: [
            { value: "30+", label: "Years of Service" },
            { value: "8+", label: "Branches" },
            { value: "50K+", label: "Digital Users" },
            { value: "100+", label: "Agents" },
          ],
        },

        // ── 4. Accounts carousel ──────────────────────────────────────
        {
          blockType: "product-carousel",
          heading: "Accounts to suit every Tanzanian",
          subhead: "Whether you're saving, growing a business, or planning for tomorrow.",
          cardsPerRow: "3",
          cards: [
            { title: "Mama Africa Account", description: "Everyday savings for all Tanzanians.", ctaLabel: "Explore", ctaHref: "/personal-banking#mama-africa" },
            { title: "Kilimo Tija Account", description: "Agricultural savings account.", ctaLabel: "Explore", ctaHref: "/personal-banking#kilimo-tija" },
            { title: "Jasiri Account", description: "Youth empowerment, ages 18-35.", ctaLabel: "Explore", ctaHref: "/personal-banking#jasiri" },
            { title: "Fixed Deposit Account", description: "Earn up to 10% p.a. interest.", ctaLabel: "Explore", ctaHref: "/personal-banking#fixed-deposit" },
            { title: "Msomi Account", description: "Student account, no monthly fees.", ctaLabel: "Explore", ctaHref: "/personal-banking#msomi" },
            { title: "Group Accounts", description: "For SACCOs, Vikoba and Chamas.", ctaLabel: "Explore", ctaHref: "/personal-banking#groups" },
          ],
        },

        // ── 5. CoopPesa promo ──────────────────────────────────────────
        {
          blockType: "image-text",
          eyebrow: "CoopPesa Mobile Banking",
          heading: "Your bank, in your pocket.",
          image: coopesaMockup,
          imageSide: "right",
          bullets: [
            { icon: "Send", text: "Instant transfers to any bank or mobile wallet." },
            { icon: "Receipt", text: "Pay LUKU, DAWASA, school fees and government services." },
            { icon: "CreditCard", text: "Apply for digital loans and get approved instantly." },
            { icon: "Shield", text: "Fingerprint and Face ID for secure access." },
            { icon: "Bell", text: "Real-time push notifications for every transaction." },
            { icon: "QrCode", text: "TAN-QR Lipa Namba — scan to pay across all networks." },
          ],
          ctas: [
            { label: "Get the App", href: "/digital-banking#coopesa" },
            { label: "USSD *150*84#", href: "/digital-banking#ussd" },
          ],
        },

        // ── 6. Cards & loans grid ─────────────────────────────────────
        {
          blockType: "product-grid",
          heading: "Cards, Payments & Loans",
          columns: "3",
          tiles: [
            { title: "Visa Debit Card", description: "Linked to your CoopBank account.", icon: "CreditCard", href: "/cards#visa-debit" },
            { title: "Visa Prepaid Card", description: "Load and spend anywhere.", icon: "CreditCard", href: "/cards#visa-prepaid" },
            { title: "TAN-QR Pay", description: "Lipa Namba across all networks.", icon: "QrCode", href: "/cards#qr-pay" },
            { title: "Online Shopping", description: "Secure e-commerce payments.", icon: "Globe", href: "/cards#online" },
            { title: "Bill Payments", description: "LUKU, DAWASA, school fees & more.", icon: "ShoppingCart", href: "/cards#bill-pay" },
            { title: "Agri-Business Loans", description: "TSH 100K-50M, 8-12% rate.", icon: "Tractor", href: "/loan-products#agri-business" },
            { title: "Salaried Loans", description: "Fast payroll-linked loans.", icon: "PiggyBank", href: "/loan-products#salaried" },
            { title: "Digital Loans", description: "Instant via CoopPesa app.", icon: "Smartphone", href: "/loan-products#digital" },
            { title: "SME Loans", description: "Working capital & asset finance.", icon: "Briefcase", href: "/loan-products#sme" },
            { title: "Asset Financing", description: "Up to 80% of asset value.", icon: "Car", href: "/loan-products#asset-financing" },
            { title: "Business Loans", description: "Corporate & large enterprise.", icon: "Store", href: "/loan-products#business" },
          ],
        },

        // ── 7. Why CoopBank ──────────────────────────────────────────
        {
          blockType: "product-grid",
          heading: "Why CoopBank",
          columns: "4",
          tiles: [
            { title: "Security & Trust", description: "Regulated by the Bank of Tanzania since 1995.", icon: "Shield", href: "/about-us" },
            { title: "Community Focus", description: "Banking that builds local economies, not extracts from them.", icon: "Heart", href: "/about-us#impact" },
            { title: "Digital Innovation", description: "Mobile-first, USSD-everywhere, agency banking in every region.", icon: "Smartphone", href: "/digital-banking" },
            { title: "Wide Coverage", description: "Branches, agents and ATMs across mainland Tanzania.", icon: "MapPin", href: "/branches" },
          ],
        },

        // ── 8. Account opening CTA ───────────────────────────────────
        {
          blockType: "cta-strip",
          headline: "Open an account in minutes",
          subhead: "No paperwork, no queues — just your ID and the CoopPesa app.",
          background: "brand",
          ctas: [
            { label: "Open Online", href: "/open-account" },
            { label: "Find a Branch", href: "/branches" },
          ],
        },

        // ── 9. Latest news strip (pulls from blog-posts) ─────────────
        {
          blockType: "featured-news",
          heading: "Latest from CoopBank",
          mode: "auto",
          limit: 3,
          category: "all",
        },
      ],
      _status: "published",
    },
  });

  const verify = await payload.find({ collection: "pages", where: { slug: { equals: "home" } }, limit: 1, draft: true });
  const blocks = (verify.docs[0]?.layout ?? []) as Array<{ blockType: string }>;
  console.log(`[homepage] created — ${blocks.length} blocks:`, blocks.map((b) => b.blockType).join(", "));
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
