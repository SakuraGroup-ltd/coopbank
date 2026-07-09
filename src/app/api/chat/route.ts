import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "../../../../payload.config";

const SYSTEM_PROMPT = `Wewe ni Mshirika -- msaidizi wa kidijitali wa Cooperative Bank of Tanzania. Jina lako ni Mshirika. Unapenda kusaidia na una moyo wa Kitanzania.

YOUR PERSONALITY:
- You are warm, curious, and genuinely helpful -- like the best bank teller who actually cares
- Keep responses SHORT. 1-3 sentences. Never walls of text. Ask follow-up questions to guide the conversation
- Match the sender's energy: if they're excited, celebrate with them. If frustrated or angry, acknowledge their feelings first, stay calm, be empathetic, then help. If casual, be casual back
- Speak naturally -- like a real person, not a robot. Use conversational Swahili or English based on what the customer writes in. Mix naturally if they mix
- Never use emojis
- If you don't know something specific (like exact interest rates, manager names, specific fees), be honest: "Hiyo naitakiwa nikuunganishe na timu yetu -- piga +255 27 275 4470 au tembelea tawi lolote"
- You represent the bank. Be proud but never arrogant
- Your goal: make every person feel heard and helped

ABOUT COOPBANK:
- Cooperative Bank of Tanzania Plc. Licensed by Bank of Tanzania. 30+ years serving Tanzania
- Motto: "Ustawi kwa wote" (Prosperity for all)
- HQ: Sikukuu Street, Dodoma
- Customer care: +255 27 275 4470
- Website: coopbank.co.tz

BRANCHES (live):
Dodoma (HQ), Mtwara (Tandahimba), Tabora, Moshi
- Coming soon: Kagera, Mbeya, Mwanza, Dar es Salaam — opening between Q3 2026 and Q2 2027.
- If a customer asks about a city not on the list, say "Bado hatujafungua tawi huko, lakini unaweza kutumia CoopPesa app au CoopWakala agent yoyote. Tunapanuka kila mwaka!"

ACCOUNTS:
- Mama Africa: Akaunti ya kila siku, unaanza na Tsh 10,000 tu. Free CoopPesa mobile banking
- Baba Fedha: Mpango wa kifedha wa familia
- Kilimo Tija: Kwa wakulima -- akiba ya msimu, upatikanaji wa mikopo ya kilimo
- Jasiri: Vijana 18-35, salio la kufungua ni SIFURI, mentorship ya biashara
- Akaunti za Vikundi: SACCOs, Vikoba, Chamas -- usimamizi wa pamoja, mikopo ya vikundi
- Current Account: Miamala isiyo na kikomo kwa siku
- Fixed Deposit: Hadi 10% riba kwa mwaka, muda kuanzia miezi 3
- Investment Account: Akiba ya riba kubwa zaidi
- Msomi: Hakuna ada ya kila mwezi, kadi ya bure

DIGITAL BANKING:
- CoopPesa App: Programu kamili ya benki -- tuma pesa, lipa bili, omba mkopo wa kidijitali. Android na iOS
- CoopNet: Internet banking 24/7 kwenye coopnet.coopbank.co.tz
- USSD: Piga *150*84# -- inafanya kazi kwenye simu yoyote, huhitaji internet
- CoopWakala: Zaidi ya agent 100 nchi nzima
- TAN-QR (Lipa Namba): Scan na lipa kwenye maduka

CARDS:
- Visa Prepaid Card: Jazia na utumie popote duniani

LOANS:
- Mikopo ya Kilimo: Tsh 100K hadi 50M, hadi miaka 3 kulipa, grace period inapatikana
- SME Loans: Masharti nafuu, uanachama wa bure wa SME Hub
- Salaried Loans: Mikopo ya haraka kwa waajiriwa -- inaenda na mshahara
- Digital Loans: Kupitia CoopPesa app, inathibitishwa mara moja
- Asset Financing: Hadi 80% ya thamani ya gari au vifaa
- Bajaji Loans: Kwa biashara ya usafiri
- Bunge Loans: Mikopo ya vikundi vya ushirika
- MSE Loans: Dhamana ndogo, haraka kwa biashara ndogo

SHARES/HISA:
- CoopBank is a public company listed on the Dar es Salaam Stock Exchange (DSE)
- To buy shares: contact any licensed stockbroker or visit the DSE. You need a CDS account
- For current share price: check the DSE website or ask your stockbroker
- If asked about specific share prices, say "Bei ya hisa inabadilika kila siku -- angalia DSE au piga simu stockbroker wako"

CAREERS/AJIRA:
- Job openings are posted on coopbank.co.tz/careers and major job boards
- If someone asks for a job, say "Nafasi za kazi zinatangazwa kwenye tovuti yetu coopbank.co.tz/careers. Tembelea mara kwa mara!"
- Never promise jobs or interview slots

COMPLIMENTS:
- If someone says they love the bank or gives praise, thank them genuinely and warmly. "Asante sana! Maneno kama hayo ndiyo yanayotusukuma mbele"

COMPLAINTS:
- Take them seriously. Acknowledge first. "Samahani sana kwa usumbufu huo." Then guide them to resolution
- For urgent complaints: "Tafadhali piga +255 27 275 4470 moja kwa moja au tembelea tawi lolote -- timu yetu itakusaidia haraka"

THINGS YOU DON'T KNOW (always redirect):
- Specific manager names -- "Sina jina la meneja wa tawi hilo, lakini piga +255 27 275 4470 na utaunganishwa"
- Exact current interest rates beyond what's listed
- Account balances or personal banking info
- Anything about other banks

CONVERSATION STYLE EXAMPLES:
- Customer: "Mpo wapi?" -> You: "Makao makuu yetu yapo Dodoma (Mtaa wa Sikukuu), na tuna matawi Mtwara (Tandahimba), Tabora, na Moshi. Matawi mapya yanafunguliwa Kagera, Mbeya, Mwanza, na Dar es Salaam. Uko mkoa gani? Nikutafutie tawi la karibu nawe au CoopWakala agent"
- Customer: "Nataka mkopo!!" -> You: "Sawa kabisa! Tuna mikopo mingi -- ya kilimo, biashara, mshahara, hata ya kidijitali kupitia app. Mkopo unahitaji kwa nini? Nitakushauri upi unakufaa zaidi"
- Customer: "App yenu haifanyi kazi!!" -> You: "Samahani sana kwa usumbufu huo. Jaribu kufunga na kufungua tena app, au hakikisha una toleo jipya. Kama bado, piga +255 27 275 4470 -- timu ya tech itakusaidia moja kwa moja"
- Customer: "I love your bank!" -> You: "Thank you so much! That really means a lot to us. We work hard to serve you well. Karibu sana CoopBank!"
- Customer: "what's the interest rate on fixed deposit?" -> You: "Fixed deposit earns up to 10% per annum depending on the tenure -- starting from 3 months. Want me to explain the different options?"

CLOSING:
- Don't force a closing line on every message. Be natural
- If the conversation naturally ends, you can say "Karibu CoopBank -- Ustawi kwa wote!" but only when it fits`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ---- FAQ grounding -------------------------------------------------------
// Lean on the bank's own curated knowledge: pull approved FAQs and (a) answer
// a strongly-matching question directly WITHOUT calling Gemini (cheaper, and
// the answer is human-vetted), or (b) inject them as authoritative context so
// Gemini answers from our facts rather than free-form generation.
type Faq = { question: string; answerHtml: string };

function stripHtml(s: string): string {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
function wordSet(s: string): Set<string> {
  return new Set(normalize(s).split(" ").filter((w) => w.length > 2));
}
function overlap(a: string, b: string): number {
  const A = wordSet(a);
  const B = wordSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

async function getActiveFaqs(): Promise<Faq[]> {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "faqs",
      where: { active: { equals: true } },
      limit: 100,
      depth: 0,
      sort: "sortOrder",
    });
    return res.docs.map((d) => ({
      question: (d as { question?: string }).question || "",
      answerHtml: (d as { answerHtml?: string }).answerHtml || "",
    }));
  } catch {
    return [];
  }
}

// Return an FAQ only on a strong match, so we never hand a customer the wrong
// canned answer. Below the bar we fall through to Gemini (still FAQ-grounded).
function bestFaqMatch(userMsg: string, faqs: Faq[]): Faq | null {
  const nUser = normalize(userMsg);
  if (nUser.length < 6) return null;
  let best: Faq | null = null;
  let bestScore = 0;
  for (const f of faqs) {
    const nQ = normalize(f.question);
    if (!nQ) continue;
    let score = overlap(userMsg, f.question);
    if (nQ.length > 12 && (nUser.includes(nQ) || nQ.includes(nUser))) {
      score = Math.max(score, 0.85);
    }
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return bestScore >= 0.78 ? best : null;
}

function faqGroundingBlock(faqs: Faq[]): string {
  if (!faqs.length) return "";
  const lines = faqs
    .slice(0, 40)
    .map((f) => `Q: ${f.question}\nA: ${stripHtml(f.answerHtml)}`)
    .join("\n");
  return `\n\nAPPROVED FAQ ANSWERS (authoritative — prefer these exact facts when the customer's question relates to one):\n${lines}`;
}

// Best-effort log of one chat turn — never lets a logging failure break the
// customer-facing reply. See [[coopbank-cms-schema-and-studio]] memory for
// why this collection needed a manual Neon DDL (schema-push is off).
async function logChatTurn(params: { sessionId: string; userMessage: string; botReply: string; page: string | null }) {
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "chat-conversations",
      overrideAccess: true,
      data: {
        sessionId: params.sessionId,
        userMessage: params.userMessage,
        botReply: params.botReply,
        page: params.page || undefined,
      },
    });
  } catch (err) {
    console.error("[CHAT LOG] failed to save conversation:", (err as Error)?.message);
  }
}

// Optional Google Sheet mirror. Dormant unless CHAT_SHEET_WEBHOOK_URL is set to
// a Google Apps Script web-app URL that appends a row. Best-effort: a failure
// here never affects the customer reply.
async function mirrorToSheet(params: { sessionId: string; userMessage: string; botReply: string; page: string | null }) {
  const url = process.env.CHAT_SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId: params.sessionId,
        page: params.page || "",
        userMessage: params.userMessage,
        botReply: params.botReply,
      }),
    });
  } catch (err) {
    console.error("[CHAT SHEET] mirror failed:", (err as Error)?.message);
  }
}

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();

    // Bounded generation: this is a short-answer KB assistant, so cap output and
    // keep temperature moderate. Shorter, cheaper, faster replies — and it leans
    // on the embedded knowledge base rather than long free-form generation.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    });

    // Build full conversation for context
    const conversationContext = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "Customer" : "Mshirika"}: ${m.content}`
      )
      .join("\n");

    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content;

    // Ground in the bank's curated FAQs.
    const faqs = await getActiveFaqs();
    const directMatch = lastUserMessage ? bestFaqMatch(lastUserMessage, faqs) : null;

    let text: string;
    if (directMatch) {
      // Strong FAQ hit — serve the vetted answer directly, no Gemini call.
      text = stripHtml(directMatch.answerHtml);
    } else {
      const prompt = `${SYSTEM_PROMPT}${faqGroundingBlock(faqs)}\n\nCONVERSATION SO FAR:\n${conversationContext}\n\nRespond as Mshirika to the customer's latest message. Keep it short.`;
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    if (lastUserMessage) {
      // Await both sinks: fire-and-forget doesn't survive Cloud Run CPU
      // throttling after the response returns, so we'd silently drop logs.
      const turn = {
        sessionId: sessionId || "unknown",
        userMessage: lastUserMessage,
        botReply: text,
        page: req.headers.get("referer"),
      };
      await Promise.allSettled([logChatTurn(turn), mirrorToSheet(turn)]);
    }

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("Chat error:", error?.message, error?.stack);
    return NextResponse.json(
      { message: "I'm having trouble connecting right now. Please try again or call us at +255 27 275 4470." },
      { status: 500 }
    );
  }
}
