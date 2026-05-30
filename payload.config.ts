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
import { WhistleblowerReports } from "./src/payload/collections/WhistleblowerReports";

import { Header } from "./src/payload/globals/Header";
import { Footer } from "./src/payload/globals/Footer";
import { Homepage } from "./src/payload/globals/Homepage";
import { SiteSettings } from "./src/payload/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: "users",
    // Brand the admin so it visibly reads as CoopBank, not generic Payload.
    // The custom CSS is injected via the (payload) route-group layout import,
    // not via an admin.css config — that property isn't on Payload 3.85's type.
    components: {
      graphics: {
        Logo: "/src/payload/components/Logo",
        Icon: "/src/payload/components/Icon",
      },
    },
    meta: {
      titleSuffix: " — CoopBank Admin",
      icons: [{ rel: "icon", url: "/apple-icon.png", type: "image/png" }],
      openGraph: {
        title: "Cooperative Bank Tanzania — Admin",
        siteName: "CoopBank Admin",
      },
    },
    theme: "light",
  },
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
    WhistleblowerReports,
  ],
  globals: [Header, Footer, Homepage, SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "spike-secret-not-for-prod",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
});
