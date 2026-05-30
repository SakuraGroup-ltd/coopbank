// Pre-loaded via `node --require` so the patch lands before any of payload's
// ESM modules resolve. Next 16 dropped @next/env's default export and Payload
// 3.85's loadEnv.js destructures from it — patch it back to itself.
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const nextEnv = require("@next/env");
if (!nextEnv.default) {
  nextEnv.default = nextEnv;
}
