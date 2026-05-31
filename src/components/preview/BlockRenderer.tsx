/* eslint-disable @next/next/no-img-element */
// Real renderers for every block type editors can drop into a Page. The
// markup intentionally mirrors the public CoopBank site's Tailwind so Live
// Preview reads as the actual published page, not a wireframe. Anything we
// don't know how to render falls through to a labelled debug card — easier
// for editors to spot a misconfigured block than a silent blank.
import type { JSX } from "react";

type MediaRef = { url?: string; alt?: string } | string | null | undefined;

const mediaUrl = (m: MediaRef): string | undefined =>
  !m ? undefined : typeof m === "string" ? m : m.url;
const mediaAlt = (m: MediaRef): string =>
  !m || typeof m === "string" ? "" : m.alt || "";

type Block = { blockType: string; [k: string]: unknown };

// ─────────────────────────── Hero ────────────────────────────────
function HeroRender({ block }: { block: Block }) {
  const image = block.image as MediaRef;
  return (
    <section className="relative bg-[#0F3D7A] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          {(block.eyebrow as string) && (
            <p className="text-[#1A8A3A] text-sm font-semibold uppercase tracking-widest mb-3">
              {block.eyebrow as string}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {(block.headline as string) || "Headline"}
          </h1>
          {(block.subhead as string) && (
            <p className="text-white/80 text-lg mb-6">{block.subhead as string}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {Array.isArray(block.ctas) &&
              (block.ctas as Array<{ label: string; href: string; style?: string }>).map(
                (cta, i) => (
                  <a
                    key={i}
                    href={cta.href}
                    className={
                      cta.style === "secondary"
                        ? "border-2 border-white px-5 py-2.5 rounded font-semibold hover:bg-white hover:text-[#0F3D7A] transition"
                        : "bg-[#1A8A3A] hover:bg-[#14692D] px-5 py-2.5 rounded font-semibold transition"
                    }
                  >
                    {cta.label}
                  </a>
                ),
              )}
          </div>
        </div>
        {mediaUrl(image) && (
          <img src={mediaUrl(image)} alt={mediaAlt(image)} className="rounded-lg w-full" />
        )}
      </div>
    </section>
  );
}

// ─────────────────────── Media Slider ────────────────────────────
function MediaSliderRender({ block }: { block: Block }) {
  // Live Preview is static; show first slide prominently, subsequent as thumbs.
  const slides =
    (block.slides as Array<{
      image?: MediaRef;
      eyebrow?: string;
      headline?: string;
      subhead?: string;
      ctaLabel?: string;
      ctaHref?: string;
    }>) || [];
  const first = slides[0];
  if (!first) return null;
  return (
    <section className="relative">
      <div className="relative h-[500px] overflow-hidden">
        {mediaUrl(first.image) && (
          <img
            src={mediaUrl(first.image)}
            alt={mediaAlt(first.image)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F3D7A]/85 via-[#0F3D7A]/45 to-transparent" />
        <div className="relative h-full max-w-6xl mx-auto px-6 flex items-center text-white">
          <div className="max-w-xl">
            {first.eyebrow && (
              <p className="text-[#1A8A3A] uppercase text-sm font-semibold tracking-widest mb-3">
                {first.eyebrow}
              </p>
            )}
            {first.headline && (
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                {first.headline}
              </h2>
            )}
            {first.subhead && <p className="text-lg text-white/85 mb-6">{first.subhead}</p>}
            {first.ctaLabel && first.ctaHref && (
              <a
                href={first.ctaHref}
                className="inline-block bg-[#1A8A3A] hover:bg-[#14692D] px-6 py-3 rounded font-semibold transition"
              >
                {first.ctaLabel}
              </a>
            )}
          </div>
        </div>
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={
                  "h-2 rounded-full transition-all " +
                  (i === 0 ? "w-8 bg-white" : "w-2 bg-white/40")
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────── Product Grid ────────────────────────────
function ProductGridRender({ block }: { block: Block }) {
  const tiles =
    (block.tiles as Array<{
      title: string;
      description?: string;
      icon?: string;
      image?: MediaRef;
      href: string;
    }>) || [];
  const cols = ((block.columns as string) || "3") === "4"
    ? "md:grid-cols-4"
    : (block.columns as string) === "2"
      ? "md:grid-cols-2"
      : "md:grid-cols-3";
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {(block.heading as string) && (
          <h2 className="text-3xl font-bold text-[#0F3D7A] text-center mb-3">
            {block.heading as string}
          </h2>
        )}
        {(block.subhead as string) && (
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            {block.subhead as string}
          </p>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-6`}>
          {tiles.map((t, i) => (
            <a
              key={i}
              href={t.href}
              className="group block p-6 rounded-xl bg-[#f7f8fb] border border-transparent hover:border-[#1A8A3A] hover:shadow-lg transition-all"
            >
              {mediaUrl(t.image) && (
                <img
                  src={mediaUrl(t.image)}
                  alt={mediaAlt(t.image)}
                  className="w-12 h-12 object-contain mb-4"
                />
              )}
              <h3 className="text-lg font-semibold text-[#0F3D7A] mb-2 group-hover:text-[#1A8A3A]">
                {t.title}
              </h3>
              {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────── Product Carousel ────────────────────────
function ProductCarouselRender({ block }: { block: Block }) {
  const cards =
    (block.cards as Array<{
      title: string;
      description?: string;
      image?: MediaRef;
      ctaLabel?: string;
      ctaHref: string;
      badge?: string;
    }>) || [];
  const perRow = ((block.cardsPerRow as string) || "3") === "4"
    ? "md:grid-cols-4"
    : (block.cardsPerRow as string) === "2"
      ? "md:grid-cols-2"
      : "md:grid-cols-3";
  return (
    <section className="py-16 px-6 bg-[#f7f8fb]">
      <div className="max-w-6xl mx-auto">
        {(block.heading as string) && (
          <h2 className="text-3xl font-bold text-[#0F3D7A] text-center mb-3">
            {block.heading as string}
          </h2>
        )}
        {(block.subhead as string) && (
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            {block.subhead as string}
          </p>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${perRow} gap-6`}>
          {cards.map((c, i) => (
            <div key={i} className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {c.badge && (
                <span className="absolute top-3 right-3 z-10 bg-[#1A8A3A] text-white text-xs uppercase tracking-wider px-2 py-1 rounded">
                  {c.badge}
                </span>
              )}
              {mediaUrl(c.image) && (
                <div className="aspect-[4/3] overflow-hidden bg-[#0F3D7A]/10">
                  <img
                    src={mediaUrl(c.image)}
                    alt={mediaAlt(c.image)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#0F3D7A] mb-2">{c.title}</h3>
                {c.description && <p className="text-sm text-gray-600 mb-4">{c.description}</p>}
                <a
                  href={c.ctaHref}
                  className="text-[#1A8A3A] text-sm font-semibold uppercase tracking-wider hover:text-[#14692D]"
                >
                  {c.ctaLabel || "Explore"} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────── Image + Text ────────────────────────────
function ImageTextRender({ block }: { block: Block }) {
  const image = block.image as MediaRef;
  const side = ((block.imageSide as string) || "right") === "left" ? "left" : "right";
  const bullets =
    (block.bullets as Array<{ icon?: string; text: string }>) || [];
  const ctas = (block.ctas as Array<{ label: string; href: string }>) || [];
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {side === "left" && mediaUrl(image) && (
          <img src={mediaUrl(image)} alt={mediaAlt(image)} className="rounded-xl w-full" />
        )}
        <div>
          {(block.eyebrow as string) && (
            <p className="text-[#1A8A3A] uppercase text-sm font-semibold tracking-widest mb-3">
              {block.eyebrow as string}
            </p>
          )}
          <h2 className="text-3xl font-bold text-[#0F3D7A] mb-4">
            {(block.heading as string) || "Heading"}
          </h2>
          {Boolean(block.body) && (
            <div className="prose prose-lg text-gray-700 mb-6">
              <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(block.body, null, 2)}
              </pre>
            </div>
          )}
          {bullets.length > 0 && (
            <ul className="space-y-2 mb-6">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-[#1A8A3A] font-bold mt-1">✓</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-3">
            {ctas.map((cta, i) => (
              <a
                key={i}
                href={cta.href}
                className={
                  i === 0
                    ? "bg-[#1A8A3A] hover:bg-[#14692D] text-white px-5 py-2.5 rounded font-semibold transition"
                    : "border-2 border-[#0F3D7A] text-[#0F3D7A] px-5 py-2.5 rounded font-semibold hover:bg-[#0F3D7A] hover:text-white transition"
                }
              >
                {cta.label}
              </a>
            ))}
          </div>
        </div>
        {side === "right" && mediaUrl(image) && (
          <img src={mediaUrl(image)} alt={mediaAlt(image)} className="rounded-xl w-full" />
        )}
      </div>
    </section>
  );
}

// ─────────────────────────── Stats ───────────────────────────────
function StatsRender({ block }: { block: Block }) {
  const stats = (block.stats as Array<{ value: string; label: string }>) || [];
  return (
    <section className="py-12 px-6 bg-[#0F3D7A] text-white">
      <div className="max-w-6xl mx-auto">
        {(block.heading as string) && (
          <h2 className="text-center text-2xl font-semibold mb-8">{block.heading as string}</h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">{s.value}</p>
              <p className="text-sm uppercase tracking-wider text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── FAQ ─────────────────────────────────
function FAQRender({ block }: { block: Block }) {
  const items =
    (block.items as Array<{ question: string; answer: unknown }>) || [];
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {(block.heading as string) && (
          <h2 className="text-3xl font-bold text-[#0F3D7A] text-center mb-10">
            {block.heading as string}
          </h2>
        )}
        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="border border-gray-200 rounded-lg px-5 py-4 group hover:border-[#1A8A3A] transition-colors"
            >
              <summary className="flex justify-between items-center font-semibold text-[#0F3D7A] cursor-pointer list-none">
                <span>{item.question}</span>
                <span className="text-[#1A8A3A] group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="mt-3 text-gray-700 text-sm">
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(item.answer, null, 2)}
                </pre>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────── CTA Strip ───────────────────────────────
function CTAStripRender({ block }: { block: Block }) {
  const bg = (block.background as string) || "brand";
  const bgClass =
    bg === "dark"
      ? "bg-[#0a2b5a] text-white"
      : bg === "neutral"
        ? "bg-[#f7f8fb] text-[#0F3D7A]"
        : "bg-[#0F3D7A] text-white";
  const ctas = (block.ctas as Array<{ label: string; href: string }>) || [];
  return (
    <section className={`py-12 px-6 ${bgClass}`}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          {(block.headline as string) || "Headline"}
        </h2>
        {(block.subhead as string) && (
          <p className={`text-lg mb-6 ${bg === "neutral" ? "text-gray-600" : "text-white/85"}`}>
            {block.subhead as string}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {ctas.map((cta, i) => (
            <a
              key={i}
              href={cta.href}
              className={
                i === 0
                  ? "bg-[#1A8A3A] hover:bg-[#14692D] text-white px-6 py-3 rounded font-semibold transition"
                  : bg === "neutral"
                    ? "border-2 border-[#0F3D7A] text-[#0F3D7A] px-6 py-3 rounded font-semibold hover:bg-[#0F3D7A] hover:text-white transition"
                    : "border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-[#0F3D7A] transition"
              }
            >
              {cta.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────── Featured News ───────────────────────────
function FeaturedNewsRender({ block }: { block: Block }) {
  const posts =
    (block.posts as Array<{
      title?: string;
      slug?: string;
      excerpt?: string;
      coverImage?: MediaRef;
      publishDate?: string;
      category?: string;
    }>) || [];
  return (
    <section className="py-16 px-6 bg-[#f7f8fb]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0F3D7A]">
              {(block.heading as string) || "Latest News"}
            </h2>
            {(block.subhead as string) && (
              <p className="text-gray-600 mt-2">{block.subhead as string}</p>
            )}
          </div>
          <a href="/news" className="hidden md:block text-[#1A8A3A] font-semibold uppercase text-sm tracking-wider hover:text-[#14692D]">
            All news →
          </a>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            {(block.mode as string) === "auto"
              ? `Auto-mode: will pull the latest ${(block.limit as number) || 3} ${(block.category as string) || "all"} post(s) at publish time.`
              : "Manual mode: pick posts above."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <a
                key={i}
                href={`/news/${p.slug}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {mediaUrl(p.coverImage) && (
                  <div className="aspect-[16/9] bg-[#0F3D7A]/10">
                    <img
                      src={mediaUrl(p.coverImage)}
                      alt={mediaAlt(p.coverImage)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  {p.category && (
                    <p className="text-xs uppercase tracking-wider text-[#1A8A3A] font-semibold mb-2">
                      {p.category}
                    </p>
                  )}
                  <h3 className="font-semibold text-[#0F3D7A] mb-2 line-clamp-2">{p.title}</h3>
                  {p.excerpt && <p className="text-sm text-gray-600 line-clamp-3">{p.excerpt}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────── Rich Text ───────────────────────────────
function RichTextRender({ block }: { block: Block }) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 prose prose-lg">
      <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
        {JSON.stringify(block.content, null, 2)}
      </pre>
    </section>
  );
}

// ─────────────────────── Fallback ────────────────────────────────
function FallbackRender({ block }: { block: Block }) {
  return (
    <section className="border-2 border-dashed border-amber-400 bg-amber-50 p-6 my-2 mx-6 rounded">
      <p className="font-mono text-xs text-amber-700 uppercase font-bold">
        Unrenderable block: {block.blockType}
      </p>
      <p className="text-xs text-amber-700 mt-1">
        Add a renderer in <code>BlockRenderer.tsx</code>. Data:
      </p>
      <pre className="text-xs mt-2 overflow-x-auto bg-white p-3 rounded border border-amber-200">
        {JSON.stringify(block, null, 2)}
      </pre>
    </section>
  );
}

const renderers: Record<string, (props: { block: Block }) => JSX.Element | null> = {
  hero: HeroRender,
  "media-slider": MediaSliderRender,
  "product-grid": ProductGridRender,
  "product-carousel": ProductCarouselRender,
  "image-text": ImageTextRender,
  stats: StatsRender,
  faq: FAQRender,
  "cta-strip": CTAStripRender,
  "featured-news": FeaturedNewsRender,
  "rich-text": RichTextRender,
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!Array.isArray(blocks)) return null;
  return (
    <>
      {blocks.map((b, i) => {
        const Renderer = renderers[b.blockType] || FallbackRender;
        return <Renderer key={i} block={b} />;
      })}
    </>
  );
}
