/**
 * Migrate the previously-hardcoded CoopWakala agents into the
 * `coopwakala-agents` collection so they can be managed in the Studio.
 *
 * Run: npm run seed:agents
 *
 * Safe to re-run: if the collection already has documents it does nothing,
 * so it never duplicates the list.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { COOPWAKALA_AGENTS } from "../src/lib/coopwakala-agents-seed";

async function main() {
  const payload = await getPayload({ config });

  const existing = await payload.count({ collection: "coopwakala-agents" });
  if (existing.totalDocs > 0) {
    console.log(`[seed-agents] collection already has ${existing.totalDocs} docs — skipping.`);
    process.exit(0);
  }

  let created = 0;
  for (const a of COOPWAKALA_AGENTS) {
    await payload.create({ collection: "coopwakala-agents", data: { ...a, active: true } });
    created++;
  }
  console.log(`[seed-agents] created ${created} agents.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("[seed-agents] failed:", e);
  process.exit(1);
});
