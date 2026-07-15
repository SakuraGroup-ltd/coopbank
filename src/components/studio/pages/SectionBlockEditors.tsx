"use client";

// Mini-forms for the Task 7 section blocks. Every block here stores ALL of
// its content under a single json `data` field (see
// src/payload/blocks/sections.ts) — patches always merge into `data`, never
// onto the block root, which is why every editor below routes through
// `patcher()` instead of calling `onChange` directly.
import { Input } from "../ui/Input";
import { ImageField } from "../editor/ImageField";
import { IconSelect } from "../editor/IconSelect";
import { Label, FieldRow, Subsection, TextArea, AddBtn, RemoveBtn } from "./editor-ui";

type Block = { blockType: string; data?: Record<string, unknown>; [k: string]: unknown };
type OnChange = (d: Record<string, unknown>) => void;
type Img = { id?: number; url: string } | null;

// Every section block stores its content under `data` — patches merge there.
function dataOf(block: Block): Record<string, unknown> {
  return (block.data as Record<string, unknown>) || {};
}
function patcher(block: Block, onChange: OnChange) {
  return (patch: Record<string, unknown>) => onChange({ data: { ...dataOf(block), ...patch } });
}

export function SectionBlockEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  switch (block.blockType) {
    case "hero-slider": return <HeroSliderEditor block={block} onChange={onChange} />;
    case "quick-links": return <QuickLinksEditor block={block} onChange={onChange} />;
    case "app-promo": return <AppPromoEditor block={block} onChange={onChange} />;
    case "services-grid": return <ServicesGridEditor block={block} onChange={onChange} />;
    case "forex-ticker": return <NoConfig label="Forex ticker" note="Rates come from Studio → Forex rates. This block just places the ticker." />;
    case "page-header": return <PageHeaderEditor block={block} onChange={onChange} />;
    case "bank-prayer": return <BankPrayerEditor block={block} onChange={onChange} />;
    case "story": return <StoryEditor block={block} onChange={onChange} />;
    case "branch-network": return <BranchNetworkEditor block={block} onChange={onChange} />;
    case "journey-timeline": return <JourneyTimelineEditor block={block} onChange={onChange} />;
    case "mission-vision": return <MissionVisionEditor block={block} onChange={onChange} />;
    case "core-values": return <CoreValuesEditor block={block} onChange={onChange} />;
    case "contact-details": return <ContactDetailsEditor block={block} onChange={onChange} />;
    case "contact-form": return <ContactFormEditor block={block} onChange={onChange} />;
    case "contact-map": return <ContactMapEditor block={block} onChange={onChange} />;
    default: return null;
  }
}

function NoConfig({ label, note }: { label: string; note: string }) {
  return <p className="text-xs text-studio-ink-3">{label}: {note}</p>;
}

// ─────────────── Hero slider ───────────────
function HeroSliderEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const slides = (d.slides as Array<Record<string, unknown>>) || [];
  const setSlide = (i: number, p: Record<string, unknown>) =>
    patch({ slides: slides.map((s, idx) => (idx === i ? { ...s, ...p } : s)) });
  return (
    <div className="space-y-3">
      <Subsection title={`Slides (${slides.length}/6)`}>
        {slides.map((s, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-studio-ink">Slide {i + 1}</p>
              <RemoveBtn onClick={() => patch({ slides: slides.filter((_, idx) => idx !== i) })} />
            </div>
            <ImageField label="Background image" value={s.image as Img} alt={(s.headline as string) || "Hero slide"} onChange={(v) => setSlide(i, { image: v })} />
            <FieldRow>
              <Input value={(s.tagline as string) || ""} onChange={(e) => setSlide(i, { tagline: e.target.value })} placeholder="Swahili tagline" />
              <Input value={(s.headline as string) || ""} onChange={(e) => setSlide(i, { headline: e.target.value })} placeholder="Headline" />
            </FieldRow>
            <TextArea value={(s.desc as string) || ""} onChange={(v) => setSlide(i, { desc: v })} placeholder="Description" />
            <FieldRow>
              <Input value={(s.cta1Label as string) || ""} onChange={(e) => setSlide(i, { cta1Label: e.target.value })} placeholder="CTA 1 label" />
              <Input value={(s.cta1Href as string) || ""} onChange={(e) => setSlide(i, { cta1Href: e.target.value })} placeholder="/path or https://" />
            </FieldRow>
            <FieldRow>
              <Input value={(s.cta2Label as string) || ""} onChange={(e) => setSlide(i, { cta2Label: e.target.value })} placeholder="CTA 2 label" />
              <Input value={(s.cta2Href as string) || ""} onChange={(e) => setSlide(i, { cta2Href: e.target.value })} placeholder="/path or https://" />
            </FieldRow>
          </div>
        ))}
        {slides.length < 6 && <AddBtn onClick={() => patch({ slides: [...slides, {}] })}>Add slide</AddBtn>}
      </Subsection>
    </div>
  );
}

// ─────────────── Quick links ───────────────
function QuickLinksEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const links = (d.links as Array<Record<string, unknown>>) || [];
  const setLink = (i: number, p: Record<string, unknown>) =>
    patch({ links: links.map((l, idx) => (idx === i ? { ...l, ...p } : l)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} placeholder="Banking Made Simple" />
      </div>
      <Subsection title={`Links (${links.length}/12)`}>
        {links.map((l, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 mb-2 items-center">
            <IconSelect value={(l.icon as string) || ""} onChange={(v) => setLink(i, { icon: v })} />
            <Input value={(l.label as string) || ""} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Label" />
            <Input value={(l.href as string) || ""} onChange={(e) => setLink(i, { href: e.target.value })} placeholder="/path" />
            <RemoveBtn onClick={() => patch({ links: links.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
        {links.length < 12 && <AddBtn onClick={() => patch({ links: [...links, {}] })}>Add link</AddBtn>}
      </Subsection>
    </div>
  );
}

// ─────────────── App promo ───────────────
function AppPromoEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const features = (d.features as Array<Record<string, unknown>>) || [];
  const setFeature = (i: number, p: Record<string, unknown>) =>
    patch({ features: features.map((f, idx) => (idx === i ? { ...f, ...p } : f)) });
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Badge</Label>
          <Input value={(d.badge as string) || ""} onChange={(e) => patch({ badge: e.target.value })} placeholder="CoopPesa" />
        </div>
        <div>
          <Label>Heading</Label>
          <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
        </div>
      </FieldRow>
      <div>
        <Label>Copy</Label>
        <TextArea value={(d.copy as string) || ""} onChange={(v) => patch({ copy: v })} />
      </div>
      <ImageField label="Mockup image" value={d.mockup as Img} alt={(d.heading as string) || "App mockup"} onChange={(v) => patch({ mockup: v })} />
      <FieldRow>
        <Input value={(d.appStoreUrl as string) || ""} onChange={(e) => patch({ appStoreUrl: e.target.value })} placeholder="App Store URL" />
        <Input value={(d.playStoreUrl as string) || ""} onChange={(e) => patch({ playStoreUrl: e.target.value })} placeholder="Play Store URL" />
      </FieldRow>
      <div>
        <Label>USSD code</Label>
        <Input value={(d.ussdCode as string) || ""} onChange={(e) => patch({ ussdCode: e.target.value })} placeholder="*150*00#" />
      </div>
      <Subsection title={`Features (${features.length}/6)`}>
        {features.map((f, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 mb-2 items-center">
            <IconSelect value={(f.icon as string) || ""} onChange={(v) => setFeature(i, { icon: v })} />
            <Input value={(f.title as string) || ""} onChange={(e) => setFeature(i, { title: e.target.value })} placeholder="Title" />
            <Input value={(f.desc as string) || ""} onChange={(e) => setFeature(i, { desc: e.target.value })} placeholder="Description" />
            <RemoveBtn onClick={() => patch({ features: features.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
        {features.length < 6 && <AddBtn onClick={() => patch({ features: [...features, {}] })}>Add feature</AddBtn>}
      </Subsection>
    </div>
  );
}

// ─────────────── Services grid ───────────────
function slugifyId(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function ServicesGridEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const tabs = (d.tabs as Array<Record<string, unknown>>) || [];
  const setTab = (i: number, p: Record<string, unknown>) =>
    patch({ tabs: tabs.map((t, idx) => (idx === i ? { ...t, ...p } : t)) });
  const setItem = (ti: number, ii: number, p: Record<string, unknown>) => {
    const tab = tabs[ti];
    const items = (tab.items as Array<Record<string, unknown>>) || [];
    setTab(ti, { items: items.map((it, idx) => (idx === ii ? { ...it, ...p } : it)) });
  };
  return (
    <div className="space-y-3">
      <Subsection title={`Tabs (${tabs.length}/4)`}>
        {tabs.map((t, ti) => {
          const items = (t.items as Array<Record<string, unknown>>) || [];
          return (
            <div key={ti} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-studio-ink">Tab {ti + 1}</p>
                <RemoveBtn onClick={() => patch({ tabs: tabs.filter((_, idx) => idx !== ti) })} />
              </div>
              <FieldRow>
                <Input value={(t.label as string) || ""} onChange={(e) => setTab(ti, { label: e.target.value })} placeholder="Tab label" />
                <Input value={(t.id as string) || ""} onChange={(e) => setTab(ti, { id: e.target.value })} placeholder="tab-id" />
              </FieldRow>
              <Subsection title={`Items (${items.length}/8)`}>
                {items.map((it, ii) => (
                  <div key={ii} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 mb-2 items-center">
                    <IconSelect value={(it.icon as string) || ""} onChange={(v) => setItem(ti, ii, { icon: v })} />
                    <Input value={(it.title as string) || ""} onChange={(e) => setItem(ti, ii, { title: e.target.value })} placeholder="Title" />
                    <Input value={(it.desc as string) || ""} onChange={(e) => setItem(ti, ii, { desc: e.target.value })} placeholder="Description" />
                    <Input value={(it.href as string) || ""} onChange={(e) => setItem(ti, ii, { href: e.target.value })} placeholder="/path" />
                    <RemoveBtn onClick={() => setTab(ti, { items: items.filter((_, idx) => idx !== ii) })} />
                  </div>
                ))}
                {items.length < 8 && <AddBtn onClick={() => setTab(ti, { items: [...items, {}] })}>Add item</AddBtn>}
              </Subsection>
            </div>
          );
        })}
        {tabs.length < 4 && (
          <AddBtn
            onClick={() => {
              const label = "";
              patch({ tabs: [...tabs, { id: slugifyId(label), label, items: [] }] });
            }}
          >
            Add tab
          </AddBtn>
        )}
      </Subsection>
    </div>
  );
}

// ─────────────── Page header ───────────────
function PageHeaderEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  return (
    <div className="space-y-3">
      <FieldRow>
        <div>
          <Label>Badge</Label>
          <Input value={(d.badge as string) || ""} onChange={(e) => patch({ badge: e.target.value })} />
        </div>
        <div>
          <Label>Breadcrumb</Label>
          <Input value={(d.breadcrumb as string) || ""} onChange={(e) => patch({ breadcrumb: e.target.value })} />
        </div>
      </FieldRow>
      <div>
        <Label>Title</Label>
        <Input value={(d.title as string) || ""} onChange={(e) => patch({ title: e.target.value })} />
      </div>
      <div>
        <Label>Subtitle</Label>
        <TextArea value={(d.subtitle as string) || ""} onChange={(v) => patch({ subtitle: v })} />
      </div>
    </div>
  );
}

// ─────────────── Bank prayer ───────────────
function BankPrayerEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const paragraphs = (d.paragraphs as Array<Record<string, unknown>>) || [];
  const setPara = (i: number, p: Record<string, unknown>) =>
    patch({ paragraphs: paragraphs.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <Subsection title={`Paragraphs (${paragraphs.length})`}>
        {paragraphs.map((p, i) => (
          <div key={i} className="flex items-start gap-2 mb-2">
            <div className="flex-1">
              <TextArea
                value={(p.text as string) || ""}
                onChange={(v) => setPara(i, { text: v })}
                rows={3}
                placeholder="line breaks preserved"
              />
            </div>
            <RemoveBtn onClick={() => patch({ paragraphs: paragraphs.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
        <AddBtn onClick={() => patch({ paragraphs: [...paragraphs, {}] })}>Add paragraph</AddBtn>
      </Subsection>
      <div>
        <Label>Amen</Label>
        <Input value={(d.amen as string) || ""} onChange={(e) => patch({ amen: e.target.value })} />
      </div>
    </div>
  );
}

// ─────────────── Story ───────────────
function StoryEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const paragraphs = (d.paragraphs as Array<Record<string, unknown>>) || [];
  const setPara = (i: number, p: Record<string, unknown>) =>
    patch({ paragraphs: paragraphs.map((x, idx) => (idx === i ? { ...x, ...p } : x)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <Subsection title={`Paragraphs (${paragraphs.length})`}>
        {paragraphs.map((p, i) => (
          <div key={i} className="flex items-start gap-2 mb-2">
            <div className="flex-1">
              <TextArea value={(p.text as string) || ""} onChange={(v) => setPara(i, { text: v })} rows={4} />
            </div>
            <RemoveBtn onClick={() => patch({ paragraphs: paragraphs.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
        <AddBtn onClick={() => patch({ paragraphs: [...paragraphs, {}] })}>Add paragraph</AddBtn>
      </Subsection>
    </div>
  );
}

// ─────────────── Branch network ───────────────
function BranchNetworkEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const branches = (d.branches as Array<Record<string, unknown>>) || [];
  const setBranch = (i: number, p: Record<string, unknown>) =>
    patch({ branches: branches.map((b, idx) => (idx === i ? { ...b, ...p } : b)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <div>
        <Label>Intro</Label>
        <TextArea value={(d.intro as string) || ""} onChange={(v) => patch({ intro: v })} />
      </div>
      <Subsection title={`Branches (${branches.length}/12)`}>
        {branches.map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <Input value={(b.name as string) || ""} onChange={(e) => setBranch(i, { name: e.target.value })} placeholder="Branch name" />
            <RemoveBtn onClick={() => patch({ branches: branches.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
        {branches.length < 12 && <AddBtn onClick={() => patch({ branches: [...branches, {}] })}>Add branch</AddBtn>}
      </Subsection>
      <div>
        <Label>Coming soon text</Label>
        <TextArea value={(d.comingSoonText as string) || ""} onChange={(v) => patch({ comingSoonText: v })} />
      </div>
    </div>
  );
}

// ─────────────── Journey timeline ───────────────
function JourneyTimelineEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const milestones = (d.milestones as Array<Record<string, unknown>>) || [];
  const setMilestone = (i: number, p: Record<string, unknown>) =>
    patch({ milestones: milestones.map((m, idx) => (idx === i ? { ...m, ...p } : m)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <div>
        <Label>Intro</Label>
        <TextArea value={(d.intro as string) || ""} onChange={(v) => patch({ intro: v })} />
      </div>
      <Subsection title={`Milestones (${milestones.length}/12)`}>
        {milestones.map((m, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-studio-ink">Milestone {i + 1}</p>
              <RemoveBtn onClick={() => patch({ milestones: milestones.filter((_, idx) => idx !== i) })} />
            </div>
            <FieldRow>
              <Input value={(m.year as string) || ""} onChange={(e) => setMilestone(i, { year: e.target.value })} placeholder="Year" />
              <Input value={(m.title as string) || ""} onChange={(e) => setMilestone(i, { title: e.target.value })} placeholder="Title" />
            </FieldRow>
            <TextArea value={(m.desc as string) || ""} onChange={(v) => setMilestone(i, { desc: v })} placeholder="Description" />
          </div>
        ))}
        {milestones.length < 12 && <AddBtn onClick={() => patch({ milestones: [...milestones, {}] })}>Add milestone</AddBtn>}
      </Subsection>
    </div>
  );
}

// ─────────────── Mission & vision ───────────────
function MissionVisionEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <Subsection title="Mission">
        <Input value={(d.missionTitle as string) || ""} onChange={(e) => patch({ missionTitle: e.target.value })} placeholder="Mission title" />
        <div className="mt-2">
          <TextArea value={(d.missionText as string) || ""} onChange={(v) => patch({ missionText: v })} placeholder="Mission text" />
        </div>
      </Subsection>
      <Subsection title="Vision">
        <Input value={(d.visionTitle as string) || ""} onChange={(e) => patch({ visionTitle: e.target.value })} placeholder="Vision title" />
        <div className="mt-2">
          <TextArea value={(d.visionText as string) || ""} onChange={(v) => patch({ visionText: v })} placeholder="Vision text" />
        </div>
      </Subsection>
      <Subsection title="Purpose">
        <Input value={(d.purposeLabel as string) || ""} onChange={(e) => patch({ purposeLabel: e.target.value })} placeholder="Purpose label" />
        <div className="mt-2">
          <TextArea value={(d.purposeText as string) || ""} onChange={(v) => patch({ purposeText: v })} placeholder="Purpose text" />
        </div>
      </Subsection>
    </div>
  );
}

// ─────────────── Core values ───────────────
function CoreValuesEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const values = (d.values as Array<Record<string, unknown>>) || [];
  const setValue = (i: number, p: Record<string, unknown>) =>
    patch({ values: values.map((v, idx) => (idx === i ? { ...v, ...p } : v)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <Subsection title={`Values (${values.length}/8)`}>
        {values.map((v, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <IconSelect value={(v.icon as string) || ""} onChange={(val) => setValue(i, { icon: val })} />
              <RemoveBtn onClick={() => patch({ values: values.filter((_, idx) => idx !== i) })} />
            </div>
            <Input value={(v.title as string) || ""} onChange={(e) => setValue(i, { title: e.target.value })} placeholder="Title" />
            <TextArea value={(v.description as string) || ""} onChange={(val) => setValue(i, { description: val })} placeholder="Description" />
          </div>
        ))}
        {values.length < 8 && <AddBtn onClick={() => patch({ values: [...values, {}] })}>Add value</AddBtn>}
      </Subsection>
    </div>
  );
}

// ─────────────── Contact details ───────────────
function ContactDetailsEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <div>
        <Label>Intro</Label>
        <TextArea value={(d.intro as string) || ""} onChange={(v) => patch({ intro: v })} />
      </div>
      <FieldRow>
        <div>
          <Label>Phone</Label>
          <Input value={(d.phone as string) || ""} onChange={(e) => patch({ phone: e.target.value })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={(d.email as string) || ""} onChange={(e) => patch({ email: e.target.value })} />
        </div>
      </FieldRow>
      <div>
        <Label>Address</Label>
        <TextArea value={(d.address as string) || ""} onChange={(v) => patch({ address: v })} />
      </div>
      <div>
        <Label>Hours</Label>
        <Input value={(d.hours as string) || ""} onChange={(e) => patch({ hours: e.target.value })} placeholder="Mon–Fri 8:00–17:00" />
      </div>
    </div>
  );
}

// ─────────────── Contact form ───────────────
function ContactFormEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <div>
        <Label>Intro</Label>
        <TextArea value={(d.intro as string) || ""} onChange={(v) => patch({ intro: v })} />
      </div>
      <div>
        <Label>Success message</Label>
        <TextArea value={(d.successMessage as string) || ""} onChange={(v) => patch({ successMessage: v })} />
      </div>
    </div>
  );
}

// ─────────────── Contact map ───────────────
function ContactMapEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} />
      </div>
      <div>
        <Label hint="Google Maps → Share → Embed → copy the src URL (must start with https://www.google.com/maps/embed)">Embed URL</Label>
        <Input value={(d.embedUrl as string) || ""} onChange={(e) => patch({ embedUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
      </div>
    </div>
  );
}
