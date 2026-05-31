"use client";

// Per-block-type mini-form. Each block has its own schema; this dispatches
// to the right editor and keeps the parent (PageComposer) free of block
// specifics. Kept dense intentionally — editors get many blocks per page,
// so each editor stays compact, no big card chrome.
import { Plus, X } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type Block = { blockType: string; [k: string]: unknown };

export function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
}) {
  switch (block.blockType) {
    case "hero":
      return <HeroEditor block={block} onChange={onChange} />;
    case "media-slider":
      return <MediaSliderEditor block={block} onChange={onChange} />;
    case "product-carousel":
      return <ProductCarouselEditor block={block} onChange={onChange} />;
    case "product-grid":
      return <ProductGridEditor block={block} onChange={onChange} />;
    case "image-text":
      return <ImageTextEditor block={block} onChange={onChange} />;
    case "rich-text":
      return <RichTextEditor block={block} onChange={onChange} />;
    case "stats":
      return <StatsEditor block={block} onChange={onChange} />;
    case "faq":
      return <FAQEditor block={block} onChange={onChange} />;
    case "cta-strip":
      return <CTAStripEditor block={block} onChange={onChange} />;
    case "featured-news":
      return <FeaturedNewsEditor block={block} onChange={onChange} />;
    default:
      return (
        <p className="text-xs text-studio-ink-3 font-mono">
          No editor for blockType=&quot;{block.blockType}&quot;
        </p>
      );
  }
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">{children}</span>
      {hint && <span className="text-[10px] text-studio-ink-3">{hint}</span>}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-studio-border pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <p className="text-xs font-semibold text-studio-ink-2 mb-3">{title}</p>
      {children}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg border border-studio-border bg-studio-panel text-sm focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
    />
  );
}

// ─────────────── Hero ───────────────
function HeroEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const ctas = (block.ctas as Array<{ label: string; href: string; style?: string }>) || [];
  return (
    <div className="space-y-3">
      <div>
        <Label>Eyebrow</Label>
        <Input value={(block.eyebrow as string) || ""} onChange={(e) => onChange({ eyebrow: e.target.value })} placeholder="Small label above headline" />
      </div>
      <div>
        <Label>Headline</Label>
        <Input value={(block.headline as string) || ""} onChange={(e) => onChange({ headline: e.target.value })} />
      </div>
      <div>
        <Label>Subhead</Label>
        <TextArea value={(block.subhead as string) || ""} onChange={(v) => onChange({ subhead: v })} />
      </div>
      <Subsection title={`Call-to-actions (${ctas.length}/2)`}>
        {ctas.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-2">
            <Input value={c.label} onChange={(e) => updateArr("ctas", ctas, i, { label: e.target.value }, onChange)} placeholder="Label" />
            <Input value={c.href} onChange={(e) => updateArr("ctas", ctas, i, { href: e.target.value }, onChange)} placeholder="/path" />
            <Select value={c.style || "primary"} onChange={(e) => updateArr("ctas", ctas, i, { style: e.target.value }, onChange)} className="w-28">
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </Select>
            <RemoveBtn onClick={() => removeArr("ctas", ctas, i, onChange)} />
          </div>
        ))}
        {ctas.length < 2 && (
          <AddBtn onClick={() => onChange({ ctas: [...ctas, { label: "", href: "", style: "primary" }] })}>Add CTA</AddBtn>
        )}
      </Subsection>
    </div>
  );
}

// ─────────────── Media Slider ───────────────
function MediaSliderEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const slides = (block.slides as Array<Record<string, string>>) || [];
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Autoplay</Label>
          <Select value={(block.autoplay as boolean) === false ? "off" : "on"} onChange={(e) => onChange({ autoplay: e.target.value === "on" })}>
            <option value="on">Yes</option>
            <option value="off">No</option>
          </Select>
        </div>
        <div>
          <Label>Interval (s)</Label>
          <Input type="number" min={3} max={30} value={String(block.intervalSeconds ?? 6)} onChange={(e) => onChange({ intervalSeconds: Number(e.target.value) })} />
        </div>
      </FieldRow>
      <Subsection title={`Slides (${slides.length})`}>
        {slides.map((s, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-studio-ink">Slide {i + 1}</p>
              <RemoveBtn onClick={() => removeArr("slides", slides, i, onChange)} />
            </div>
            <Input value={s.eyebrow || ""} onChange={(e) => updateArr("slides", slides, i, { eyebrow: e.target.value }, onChange)} placeholder="Eyebrow" />
            <Input value={s.headline || ""} onChange={(e) => updateArr("slides", slides, i, { headline: e.target.value }, onChange)} placeholder="Headline" />
            <TextArea value={s.subhead || ""} onChange={(v) => updateArr("slides", slides, i, { subhead: v }, onChange)} placeholder="Subhead" />
            <FieldRow>
              <Input value={s.ctaLabel || ""} onChange={(e) => updateArr("slides", slides, i, { ctaLabel: e.target.value }, onChange)} placeholder="CTA label" />
              <Input value={s.ctaHref || ""} onChange={(e) => updateArr("slides", slides, i, { ctaHref: e.target.value }, onChange)} placeholder="/path" />
            </FieldRow>
          </div>
        ))}
        <AddBtn onClick={() => onChange({ slides: [...slides, {}] })}>Add slide</AddBtn>
      </Subsection>
    </div>
  );
}

// ─────────────── Product Carousel ───────────────
function ProductCarouselEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const cards = (block.cards as Array<Record<string, string>>) || [];
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Heading</Label>
          <Input value={(block.heading as string) || ""} onChange={(e) => onChange({ heading: e.target.value })} />
        </div>
        <div>
          <Label>Cards per row</Label>
          <Select value={(block.cardsPerRow as string) || "3"} onChange={(e) => onChange({ cardsPerRow: e.target.value })}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Select>
        </div>
      </FieldRow>
      <div>
        <Label>Subhead</Label>
        <TextArea value={(block.subhead as string) || ""} onChange={(v) => onChange({ subhead: v })} />
      </div>
      <Subsection title={`Cards (${cards.length})`}>
        {cards.map((c, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-studio-ink">Card {i + 1}</p>
              <RemoveBtn onClick={() => removeArr("cards", cards, i, onChange)} />
            </div>
            <Input value={c.title || ""} onChange={(e) => updateArr("cards", cards, i, { title: e.target.value }, onChange)} placeholder="Title" />
            <TextArea value={c.description || ""} onChange={(v) => updateArr("cards", cards, i, { description: v }, onChange)} placeholder="Description" />
            <FieldRow>
              <Input value={c.ctaLabel || ""} onChange={(e) => updateArr("cards", cards, i, { ctaLabel: e.target.value }, onChange)} placeholder="CTA label" />
              <Input value={c.ctaHref || ""} onChange={(e) => updateArr("cards", cards, i, { ctaHref: e.target.value }, onChange)} placeholder="/path" />
            </FieldRow>
            <FieldRow>
              <Input value={c.badge || ""} onChange={(e) => updateArr("cards", cards, i, { badge: e.target.value }, onChange)} placeholder="Badge (e.g. NEW)" />
              <Input value={c.icon || ""} onChange={(e) => updateArr("cards", cards, i, { icon: e.target.value }, onChange)} placeholder="Lucide icon name" />
            </FieldRow>
          </div>
        ))}
        <AddBtn onClick={() => onChange({ cards: [...cards, { ctaLabel: "EXPLORE", ctaHref: "" }] })}>Add card</AddBtn>
      </Subsection>
    </div>
  );
}

// ─────────────── Product Grid ───────────────
function ProductGridEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const tiles = (block.tiles as Array<Record<string, string>>) || [];
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Heading</Label>
          <Input value={(block.heading as string) || ""} onChange={(e) => onChange({ heading: e.target.value })} />
        </div>
        <div>
          <Label>Columns</Label>
          <Select value={(block.columns as string) || "3"} onChange={(e) => onChange({ columns: e.target.value })}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Select>
        </div>
      </FieldRow>
      <div>
        <Label>Subhead</Label>
        <TextArea value={(block.subhead as string) || ""} onChange={(v) => onChange({ subhead: v })} />
      </div>
      <Subsection title={`Tiles (${tiles.length})`}>
        {tiles.map((t, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-studio-ink">Tile {i + 1}</p>
              <RemoveBtn onClick={() => removeArr("tiles", tiles, i, onChange)} />
            </div>
            <Input value={t.title || ""} onChange={(e) => updateArr("tiles", tiles, i, { title: e.target.value }, onChange)} placeholder="Title" />
            <Input value={t.description || ""} onChange={(e) => updateArr("tiles", tiles, i, { description: e.target.value }, onChange)} placeholder="Short description" />
            <FieldRow>
              <Input value={t.href || ""} onChange={(e) => updateArr("tiles", tiles, i, { href: e.target.value }, onChange)} placeholder="/path" />
              <Input value={t.icon || ""} onChange={(e) => updateArr("tiles", tiles, i, { icon: e.target.value }, onChange)} placeholder="Lucide icon" />
            </FieldRow>
          </div>
        ))}
        <AddBtn onClick={() => onChange({ tiles: [...tiles, { href: "" }] })}>Add tile</AddBtn>
      </Subsection>
    </div>
  );
}

// ─────────────── Image + Text ───────────────
function ImageTextEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const bullets = (block.bullets as Array<{ text: string; icon?: string }>) || [];
  const ctas = (block.ctas as Array<{ label: string; href: string }>) || [];
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Eyebrow</Label>
          <Input value={(block.eyebrow as string) || ""} onChange={(e) => onChange({ eyebrow: e.target.value })} />
        </div>
        <div>
          <Label>Image side</Label>
          <Select value={(block.imageSide as string) || "right"} onChange={(e) => onChange({ imageSide: e.target.value })}>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </Select>
        </div>
      </FieldRow>
      <div>
        <Label>Heading</Label>
        <Input value={(block.heading as string) || ""} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      <Subsection title={`Bullets (${bullets.length})`}>
        {bullets.map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <Input value={b.text} onChange={(e) => updateArr("bullets", bullets, i, { text: e.target.value }, onChange)} placeholder="Bullet point" />
            <RemoveBtn onClick={() => removeArr("bullets", bullets, i, onChange)} />
          </div>
        ))}
        <AddBtn onClick={() => onChange({ bullets: [...bullets, { text: "" }] })}>Add bullet</AddBtn>
      </Subsection>
      <Subsection title={`CTAs (${ctas.length}/3)`}>
        {ctas.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
            <Input value={c.label} onChange={(e) => updateArr("ctas", ctas, i, { label: e.target.value }, onChange)} placeholder="Label" />
            <Input value={c.href} onChange={(e) => updateArr("ctas", ctas, i, { href: e.target.value }, onChange)} placeholder="/path" />
            <RemoveBtn onClick={() => removeArr("ctas", ctas, i, onChange)} />
          </div>
        ))}
        {ctas.length < 3 && (
          <AddBtn onClick={() => onChange({ ctas: [...ctas, { label: "", href: "" }] })}>Add CTA</AddBtn>
        )}
      </Subsection>
    </div>
  );
}

// ─────────────── Rich Text ───────────────
function RichTextEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div>
      <Label hint="Stored as Lexical JSON — edit in Payload admin for now">Content</Label>
      <pre className="text-xs bg-studio-soft border border-studio-border p-3 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
        {JSON.stringify(block.content, null, 2) || "null"}
      </pre>
      <p className="text-xs text-studio-ink-3 mt-2">
        Rich text editing inside the page composer is the next thing to wire — for now,
        legacy posts edit through Payload admin. Studio reads & saves the JSON intact.
      </p>
    </div>
  );
}

// ─────────────── Stats ───────────────
function StatsEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const stats = (block.stats as Array<{ value: string; label: string }>) || [];
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(block.heading as string) || ""} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      <Subsection title={`Stats (${stats.length})`}>
        {stats.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
            <Input value={s.value} onChange={(e) => updateArr("stats", stats, i, { value: e.target.value }, onChange)} placeholder="30+" />
            <Input value={s.label} onChange={(e) => updateArr("stats", stats, i, { label: e.target.value }, onChange)} placeholder="Years serving Tanzania" />
            <RemoveBtn onClick={() => removeArr("stats", stats, i, onChange)} />
          </div>
        ))}
        <AddBtn onClick={() => onChange({ stats: [...stats, { value: "", label: "" }] })}>Add stat</AddBtn>
      </Subsection>
    </div>
  );
}

// ─────────────── FAQ ───────────────
function FAQEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const items = (block.items as Array<{ question: string }>) || [];
  return (
    <div className="space-y-3">
      <div>
        <Label>Section heading</Label>
        <Input value={(block.heading as string) || ""} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      <Subsection title={`Questions (${items.length})`}>
        {items.map((q, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <Input
              value={q.question || ""}
              onChange={(e) => updateArr("items", items, i, { question: e.target.value }, onChange)}
              placeholder="Question (answer edits in Payload admin for now)"
            />
            <RemoveBtn onClick={() => removeArr("items", items, i, onChange)} />
          </div>
        ))}
        <AddBtn onClick={() => onChange({ items: [...items, { question: "" }] })}>Add question</AddBtn>
      </Subsection>
    </div>
  );
}

// ─────────────── CTA Strip ───────────────
function CTAStripEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  const ctas = (block.ctas as Array<{ label: string; href: string }>) || [];
  return (
    <div className="space-y-3">
      <FieldRow>
        <div className="md:col-span-1">
          <Label>Background</Label>
          <Select value={(block.background as string) || "brand"} onChange={(e) => onChange({ background: e.target.value })}>
            <option value="brand">Brand</option>
            <option value="neutral">Neutral</option>
            <option value="dark">Dark</option>
          </Select>
        </div>
      </FieldRow>
      <div>
        <Label>Headline</Label>
        <Input value={(block.headline as string) || ""} onChange={(e) => onChange({ headline: e.target.value })} />
      </div>
      <div>
        <Label>Subhead</Label>
        <TextArea value={(block.subhead as string) || ""} onChange={(v) => onChange({ subhead: v })} />
      </div>
      <Subsection title={`CTAs (${ctas.length}/3)`}>
        {ctas.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
            <Input value={c.label} onChange={(e) => updateArr("ctas", ctas, i, { label: e.target.value }, onChange)} placeholder="Label" />
            <Input value={c.href} onChange={(e) => updateArr("ctas", ctas, i, { href: e.target.value }, onChange)} placeholder="/path" />
            <RemoveBtn onClick={() => removeArr("ctas", ctas, i, onChange)} />
          </div>
        ))}
        {ctas.length < 3 && (
          <AddBtn onClick={() => onChange({ ctas: [...ctas, { label: "", href: "" }] })}>Add CTA</AddBtn>
        )}
      </Subsection>
    </div>
  );
}

// ─────────────── Featured News ───────────────
function FeaturedNewsEditor({ block, onChange }: { block: Block; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Heading</Label>
          <Input value={(block.heading as string) || "Latest News"} onChange={(e) => onChange({ heading: e.target.value })} />
        </div>
        <div>
          <Label>Mode</Label>
          <Select value={(block.mode as string) || "auto"} onChange={(e) => onChange({ mode: e.target.value })}>
            <option value="auto">Auto (latest)</option>
            <option value="manual">Manual (curated)</option>
          </Select>
        </div>
      </FieldRow>
      <div>
        <Label>Subhead</Label>
        <TextArea value={(block.subhead as string) || ""} onChange={(v) => onChange({ subhead: v })} />
      </div>
      {((block.mode as string) || "auto") === "auto" && (
        <FieldRow>
          <div>
            <Label>Limit</Label>
            <Input type="number" min={1} max={9} value={String(block.limit ?? 3)} onChange={(e) => onChange({ limit: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={(block.category as string) || "all"} onChange={(e) => onChange({ category: e.target.value })}>
              <option value="all">All</option>
              <option value="news">News</option>
              <option value="press">Press</option>
              <option value="literacy">Financial Literacy</option>
              <option value="product">Product Update</option>
            </Select>
          </div>
        </FieldRow>
      )}
    </div>
  );
}

// ─────────────── helpers ───────────────
function updateArr<T>(
  field: string,
  arr: T[],
  i: number,
  patch: Partial<T>,
  onChange: (d: Record<string, unknown>) => void,
) {
  const next = arr.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
  onChange({ [field]: next });
}

function removeArr<T>(field: string, arr: T[], i: number, onChange: (d: Record<string, unknown>) => void) {
  const next = arr.filter((_, idx) => idx !== i);
  onChange({ [field]: next });
}

function AddBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-cb-navy hover:text-cb-green px-2 py-1 rounded-md hover:bg-cb-navy/5"
    >
      <Plus className="w-3 h-3" />
      {children}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center shrink-0"
      title="Remove"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
}
