// Reads from Payload — no Sheets. Marketing maintains FAQs via the Studio.
import { getPayload } from "payload";
import config from "../../../../payload.config";
import FaqsClient from "./FaqsClient";
import type { Faq } from "./FaqsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQs — Cooperative Bank Tanzania",
  description:
    "Answers to common questions about accounts, loans, digital banking, cards, and branches at Cooperative Bank Tanzania.",
};

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  accounts: "Accounts",
  loans: "Loans",
  cards: "Cards",
  digital: "Digital Banking",
  branches: "Branches & ATMs",
  security: "Security",
};

export default async function FaqsPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "faqs",
    limit: 500,
    depth: 0,
    sort: ["category", "sortOrder"],
  });

  const faqs: Faq[] = result.docs
    .map((d) => {
      const r = d as unknown as {
        question: string;
        answerHtml: string;
        category?: string;
        sortOrder?: number;
        active?: boolean;
      };
      return {
        question: r.question,
        answer: r.answerHtml,
        category: CATEGORY_LABEL[r.category || "general"] || r.category || "General",
        order: String(r.sortOrder ?? 100),
        active: r.active === false ? "false" : "true",
      };
    })
    .filter((f) => f.active !== "false");

  return <FaqsClient faqs={faqs} />;
}
