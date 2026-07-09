// Promote a logged chat question into a draft FAQ. Called from the studio
// Conversations page. Creates the FAQ as inactive (active=false) so it never
// hits the public /faqs page until an editor refines and publishes it.
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { getStudioUser } from "@/lib/studio/auth";
import { canEdit } from "@/payload/access/roles";

export async function POST(req: Request) {
  const user = await getStudioUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!canEdit(user, "faqs")) {
    return NextResponse.json({ error: "You don't have permission to edit FAQs" }, { status: 403 });
  }

  let body: { question?: string; answer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const question = (body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  // Seed the answer with the bot's reply as a starting draft; answerHtml is a
  // required field, so never send it empty.
  const draftAnswer = (body.answer || "").trim();
  const answerHtml = draftAnswer
    ? `<p>${draftAnswer}</p>`
    : "<p>Draft — replace with the approved answer.</p>";

  try {
    const payload = await getPayload({ config });
    const faq = await payload.create({
      collection: "faqs",
      overrideAccess: true, // already authorised above
      data: {
        question: question.slice(0, 250),
        answerHtml,
        category: "general",
        active: false,
      },
    });
    return NextResponse.json({ id: faq.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create FAQ" },
      { status: 500 },
    );
  }
}
