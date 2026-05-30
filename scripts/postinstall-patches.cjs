#!/usr/bin/env node
// Re-applies two upstream patches that survive npm install:
//
//  1) @next/env (Next 16) dropped its default export. Payload 3.85's
//     loadEnv.js does `import nextEnvImport from '@next/env'` and then
//     destructures `loadEnvConfig` from it — that crashes on Next 16.
//     Fix: rewrite the import to `import * as nextEnvImport`.
//
//  2) Belt-and-braces: re-add a `.default = module.exports` line to
//     @next/env so anything else that default-imports it keeps working.
//
// These are upstream bugs in Payload 3.85 + Next 16; when Payload patches
// loadEnv.js for Next 16, this file can be deleted.

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function patchFile(relPath, search, replace, idempotenceMarker) {
  const file = path.join(repoRoot, relPath);
  if (!fs.existsSync(file)) {
    console.log(`[patches] ${relPath} — not present, skipping`);
    return;
  }
  const before = fs.readFileSync(file, "utf8");
  if (idempotenceMarker && before.includes(idempotenceMarker)) {
    console.log(`[patches] ${relPath} — already patched`);
    return;
  }
  const after = before.replace(search, replace);
  if (after === before) {
    console.log(`[patches] ${relPath} — search string not found (upstream may have moved)`);
    return;
  }
  fs.writeFileSync(file, after);
  console.log(`[patches] ${relPath} — applied`);
}

function appendIfMissing(relPath, marker, append) {
  const file = path.join(repoRoot, relPath);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, "utf8");
  if (before.includes(marker)) {
    console.log(`[patches] ${relPath} — already appended`);
    return;
  }
  fs.writeFileSync(file, before + append);
  console.log(`[patches] ${relPath} — appended`);
}

// 1) Payload 3.85 loadEnv.js — switch to namespace import
patchFile(
  "node_modules/payload/dist/bin/loadEnv.js",
  "import nextEnvImport from '@next/env';",
  "import * as nextEnvImport from '@next/env';",
  "import * as nextEnvImport"
);

// 2) @next/env — re-add a default export for any other consumer
appendIfMissing(
  "node_modules/@next/env/dist/index.js",
  "module.exports.default = module.exports",
  "\n// CoopBank patch: re-add default export removed in Next 16\nmodule.exports.default = module.exports;\n"
);
