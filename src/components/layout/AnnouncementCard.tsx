import { getPayload } from "payload";
import config from "../../../payload.config";
import AnnouncementCardClient from "./AnnouncementCardClient";

// Renders the site-settings announcement card (bottom-right slide-in) while the
// announcement is active and the event day has not yet passed. Server component:
// reads the global directly, evaluates the date window in EAT (UTC+3), and
// renders nothing on error or outside the window — so a DB hiccup can never
// break the page shell and the card ships zero client JS when it's not showing.

type MediaDoc = {
  url?: string | null;
  alt?: string | null;
  sizes?: { card?: { url?: string | null } | null } | null;
};

type AnnouncementData = {
  active?: boolean | null;
  eventDate?: string | null;
  image?: MediaDoc | string | null;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

// Tanzania is EAT, UTC+3 with no DST. The card should stay up through the whole
// of the event day (local time) and disappear the next morning. We compare
// "now" against the end of the event day, both shifted into EAT.
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

function isWithinWindow(eventDate: string): boolean {
  const event = new Date(eventDate);
  if (Number.isNaN(event.getTime())) return false;
  // End of the event day in EAT: take the EAT calendar date of the event and
  // push to 23:59:59.999 of that day, then convert back to a UTC instant.
  const eventEat = new Date(event.getTime() + EAT_OFFSET_MS);
  const endOfDayEatMs =
    Date.UTC(
      eventEat.getUTCFullYear(),
      eventEat.getUTCMonth(),
      eventEat.getUTCDate(),
      23,
      59,
      59,
      999,
    ) - EAT_OFFSET_MS;
  return Date.now() <= endOfDayEatMs;
}

// Stable, dependency-free hash so a future announcement (different title/date)
// produces a different dismiss key and re-shows for everyone.
function dismissKeyFor(title: string, eventDate: string): string {
  const input = `${title}|${eventDate}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return `agm-${(h >>> 0).toString(36)}`;
}

export default async function AnnouncementCard() {
  let card: AnnouncementData | null = null;
  try {
    const payload = await getPayload({ config });
    const site = (await payload.findGlobal({ slug: "site-settings", depth: 1 })) as {
      announcementCard?: AnnouncementData | null;
    };
    card = site?.announcementCard ?? null;
  } catch {
    return null;
  }

  if (!card?.active || !card.eventDate || !card.title) return null;
  if (!isWithinWindow(card.eventDate)) return null;

  const media = typeof card.image === "object" && card.image ? card.image : null;
  const imageUrl = media?.sizes?.card?.url || media?.url || null;
  if (!imageUrl) return null;

  return (
    <AnnouncementCardClient
      dismissKey={dismissKeyFor(card.title, card.eventDate)}
      imageUrl={imageUrl}
      imageAlt={media?.alt || card.title}
      eyebrow={card.eyebrow || undefined}
      title={card.title}
      subtitle={card.subtitle || undefined}
      ctaLabel={card.ctaLabel || "Read more"}
      ctaHref={card.ctaHref || "#"}
    />
  );
}
