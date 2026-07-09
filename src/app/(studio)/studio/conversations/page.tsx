import Link from "next/link";
import { ChevronRight, MessagesSquare, Search, TrendingUp, Clock } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/studio/ui/Card";
import { Badge } from "@/components/studio/ui/Badge";
import { PromoteToFaq } from "@/components/studio/conversations/PromoteToFaq";

export const dynamic = "force-dynamic";

type Convo = {
  id: string | number;
  sessionId?: string;
  userMessage: string;
  botReply?: string;
  page?: string;
  createdAt: string;
};

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStudioUser();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "chat-conversations",
    limit: 500,
    depth: 0,
    sort: "-createdAt",
    ...(query
      ? { where: { userMessage: { contains: query } } }
      : {}),
  });
  const convos = result.docs.map((d) => d as unknown as Convo);

  // Aggregate the most-asked questions (normalised) so real concerns surface
  // above one-off chatter. Keep a representative original phrasing + the most
  // recent bot reply to seed an FAQ answer.
  const groups = new Map<string, { sample: string; reply?: string; count: number; last: string }>();
  for (const c of convos) {
    if (!c.userMessage) continue;
    const key = normalize(c.userMessage);
    if (key.length < 4) continue;
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      if (new Date(c.createdAt) > new Date(g.last)) {
        g.last = c.createdAt;
        g.reply = c.botReply;
      }
    } else {
      groups.set(key, { sample: c.userMessage, reply: c.botReply, count: 1, last: c.createdAt });
    }
  }
  const topQuestions = [...groups.values()]
    .sort((a, b) => b.count - a.count || new Date(b.last).getTime() - new Date(a.last).getTime())
    .slice(0, 12);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Chat &amp; concerns</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <MessagesSquare className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Chat &amp; concerns</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {result.totalDocs} logged message{result.totalDocs === 1 ? "" : "s"} from the Mshirika chatbot · promote real questions into FAQs
            </p>
          </div>
        </div>
        <form className="relative" action="/studio/conversations">
          <Search className="w-4 h-4 text-studio-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search messages…"
            className="h-9 pl-9 pr-4 text-sm rounded-lg border border-studio-border bg-studio-panel focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none w-64"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top questions */}
        <Card>
          <CardHeader className="flex items-baseline justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cb-navy" />
                Most-asked questions
              </CardTitle>
              <p className="text-xs text-studio-ink-3 mt-1">
                Grouped across all logged chats. Turn recurring ones into FAQs.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {topQuestions.length === 0 ? (
              <p className="text-sm text-studio-ink-3 py-8 text-center">No questions logged yet.</p>
            ) : (
              <ul className="divide-y divide-studio-border">
                {topQuestions.map((g, i) => (
                  <li key={i} className="py-3 flex items-start gap-3">
                    <Badge tone={g.count > 1 ? "navy" : "neutral"}>×{g.count}</Badge>
                    <p className="flex-1 text-sm text-studio-ink leading-snug">{g.sample}</p>
                    <PromoteToFaq question={g.sample} answer={g.reply} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent messages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cb-navy" />
              {query ? `Results for “${query}”` : "Recent messages"}
            </CardTitle>
            <p className="text-xs text-studio-ink-3 mt-1">
              Newest first — the customer message and Mshirika&apos;s reply.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {convos.length === 0 ? (
              <p className="text-sm text-studio-ink-3 py-8 text-center">
                {query ? "No messages match your search." : "No conversations logged yet."}
              </p>
            ) : (
              <ul className="divide-y divide-studio-border">
                {convos.slice(0, 60).map((c) => (
                  <li key={String(c.id)} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-studio-ink leading-snug flex-1">
                        {c.userMessage}
                      </p>
                      <PromoteToFaq question={c.userMessage} answer={c.botReply} />
                    </div>
                    {c.botReply && (
                      <p className="text-xs text-studio-ink-2 mt-1 leading-snug line-clamp-2">
                        <span className="text-studio-ink-3">Mshirika:</span> {c.botReply}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-studio-ink-3">
                      <span>{timeAgo(c.createdAt)}</span>
                      {c.page && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[220px]">{c.page.replace(/^https?:\/\/[^/]+/, "") || "/"}</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
