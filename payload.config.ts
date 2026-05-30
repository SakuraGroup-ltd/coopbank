import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Users } from "./src/payload/collections/Users";
import { Media } from "./src/payload/collections/Media";
import { Tenders } from "./src/payload/collections/Tenders";
import { JobListings } from "./src/payload/collections/JobListings";
import { ForexRates } from "./src/payload/collections/ForexRates";
import { Branches } from "./src/payload/collections/Branches";
import { BlogPosts } from "./src/payload/collections/BlogPosts";
import { Pages } from "./src/payload/collections/Pages";

import { Header } from "./src/payload/globals/Header";
import { Footer } from "./src/payload/globals/Footer";
import { Homepage } from "./src/payload/globals/Homepage";
import { SiteSettings } from "./src/payload/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: { user: "users" },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Pages,
    BlogPosts,
    Tenders,
    JobListings,
    ForexRates,
    Branches,
  ],
  globals: [Header, Footer, Homepage, SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "spike-secret-not-for-prod",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
});
