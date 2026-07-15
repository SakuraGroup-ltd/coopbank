// data (as stored in the CMS json) → props of the real section components.
// The ONLY place stored URLs become render props, so the scheme guards
// concentrate here. Client-safe: no payload imports.
import { safeHref, safeImg } from "@/lib/safe-href";
import { defaultHeroSlides } from "@/components/home/home-defaults";

type D = Record<string, unknown>;
type Img = { url?: string } | null | undefined;
const img = (v: unknown): string => safeImg((v as Img)?.url);
const s = (v: unknown): string => (typeof v === "string" ? v : "");
const arr = (v: unknown): D[] => (Array.isArray(v) ? (v as D[]) : []);

export function mapSectionProps(blockType: string, data: D): Record<string, unknown> {
  switch (blockType) {
    case "hero-slider": {
      const slides = arr(data.slides)
        .map((sl, i) => ({
          image: img(sl.image) || defaultHeroSlides[i % defaultHeroSlides.length].image,
          tagline: s(sl.tagline),
          headline: s(sl.headline),
          desc: s(sl.desc),
          cta1: { label: s(sl.cta1Label), href: safeHref(s(sl.cta1Href)) || "/" },
          cta2: { label: s(sl.cta2Label), href: safeHref(s(sl.cta2Href)) || "/" },
        }))
        .filter((sl) => sl.headline);
      return slides.length ? { slides } : {};
    }
    case "quick-links": {
      const links = arr(data.links)
        .map((l) => ({ icon: s(l.icon), label: s(l.label), href: safeHref(s(l.href)) }))
        .filter((l) => l.label && l.href);
      return { ...(s(data.heading) ? { heading: s(data.heading) } : {}), ...(links.length ? { links } : {}) };
    }
    case "app-promo": {
      const features = arr(data.features)
        .map((f) => ({ icon: s(f.icon), title: s(f.title), desc: s(f.desc) }))
        .filter((f) => f.title);
      const out: D = {};
      for (const k of ["badge", "heading", "copy", "ussdCode"]) if (s(data[k])) out[k] = s(data[k]);
      if (safeHref(s(data.appStoreUrl))) out.appStoreUrl = safeHref(s(data.appStoreUrl));
      if (safeHref(s(data.playStoreUrl))) out.playStoreUrl = safeHref(s(data.playStoreUrl));
      if (img(data.mockup)) out.mockupImage = img(data.mockup);
      if (features.length) out.features = features;
      return out;
    }
    case "services-grid": {
      const tabs = arr(data.tabs)
        .map((t, ti) => ({
          id: s(t.id) || `tab-${ti}`,
          label: s(t.label),
          items: arr(t.items)
            .map((it) => ({ icon: s(it.icon), title: s(it.title), desc: s(it.desc), href: safeHref(s(it.href)) || "#" }))
            .filter((it) => it.title),
        }))
        .filter((t) => t.label && t.items.length);
      return tabs.length ? { tabs } : {};
    }
    case "page-header": {
      const out: D = {};
      for (const k of ["badge", "title", "subtitle", "breadcrumb"]) if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "bank-prayer": {
      const paragraphs = arr(data.paragraphs).map((p) => ({ text: s(p.text) })).filter((p) => p.text);
      return {
        ...(s(data.heading) ? { heading: s(data.heading) } : {}),
        ...(paragraphs.length ? { paragraphs } : {}),
        ...(s(data.amen) ? { amen: s(data.amen) } : {}),
      };
    }
    case "story": {
      const paragraphs = arr(data.paragraphs).map((p) => ({ text: s(p.text) })).filter((p) => p.text);
      return { ...(s(data.heading) ? { heading: s(data.heading) } : {}), ...(paragraphs.length ? { paragraphs } : {}) };
    }
    case "branch-network": {
      const branches = arr(data.branches).map((b) => ({ name: s(b.name) })).filter((b) => b.name);
      const out: D = {};
      for (const k of ["heading", "intro", "comingSoonText"]) if (s(data[k])) out[k] = s(data[k]);
      if (branches.length) out.branches = branches;
      return out;
    }
    case "journey-timeline": {
      const milestones = arr(data.milestones)
        .map((m) => ({ year: s(m.year), title: s(m.title), desc: s(m.desc), color: s(m.color) || undefined }))
        .filter((m) => m.year && m.title);
      const out: D = {};
      for (const k of ["heading", "intro"]) if (s(data[k])) out[k] = s(data[k]);
      if (milestones.length) out.milestones = milestones;
      return out;
    }
    case "mission-vision": {
      const out: D = {};
      for (const k of ["heading", "missionTitle", "missionText", "visionTitle", "visionText", "purposeLabel", "purposeText"])
        if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "core-values": {
      const values = arr(data.values)
        .map((v) => ({ icon: s(v.icon), title: s(v.title), description: s(v.description) }))
        .filter((v) => v.title);
      return { ...(s(data.heading) ? { heading: s(data.heading) } : {}), ...(values.length ? { values } : {}) };
    }
    case "contact-details": {
      const out: D = {};
      for (const k of ["heading", "intro", "address", "hours"]) if (s(data[k])) out[k] = s(data[k]);
      // phone/email are interpolated directly into tel:/mailto: hrefs by
      // ContactDetails with no sanitization of its own — a stored value like
      // "255...?subject=x" or one containing CR/LF could inject extra mailto
      // recipients/headers or a bogus tel URI. Strip to a safe charset for
      // phone, and require an actual email shape (no header-injection chars)
      // for email; omit the key entirely rather than passing through
      // anything untrusted.
      const phone = s(data.phone).replace(/[^0-9+ ()-]/g, "");
      if (phone) out.phone = phone;
      const email = s(data.email);
      if (/^[^\s@,?&<>"']+@[^\s@,?&<>"']+\.[^\s@,?&<>"']+$/.test(email)) out.email = email;
      return out;
    }
    case "contact-form": {
      const out: D = {};
      for (const k of ["heading", "intro", "successMessage"]) if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "contact-map": {
      const out: D = {};
      for (const k of ["heading", "embedUrl"]) if (s(data[k])) out[k] = s(data[k]);
      return out; // ContactMap re-validates the embed origin itself
    }
    default:
      return {};
  }
}
