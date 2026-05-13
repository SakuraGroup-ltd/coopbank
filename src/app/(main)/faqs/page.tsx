import { fetchFaqs } from "@/lib/sheets";
import FaqsClient from "./FaqsClient";

export const metadata = {
  title: "FAQs — Cooperative Bank Tanzania",
  description:
    "Answers to common questions about accounts, loans, digital banking, cards, and branches at Cooperative Bank Tanzania.",
};

export default async function FaqsPage() {
  const faqs = await fetchFaqs();
  return <FaqsClient faqs={faqs} />;
}
