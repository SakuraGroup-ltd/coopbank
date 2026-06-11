import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { gcsStorage } from "@payloadcms/storage-gcs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Users } from "./src/payload/collections/Users";
import { Media } from "./src/payload/collections/Media";
import { Tenders } from "./src/payload/collections/Tenders";
import { JobListings } from "./src/payload/collections/JobListings";
import { ForexRates } from "./src/payload/collections/ForexRates";
import { Branches } from "./src/payload/collections/Branches";
import { BankCharges } from "./src/payload/collections/BankCharges";
import { BlogPosts } from "./src/payload/collections/BlogPosts";
import { Pages } from "./src/payload/collections/Pages";
import { WhistleblowerReports } from "./src/payload/collections/WhistleblowerReports";
import { Faqs } from "./src/payload/collections/Faqs";
import { Auctions } from "./src/payload/collections/Auctions";
import { InterestRates } from "./src/payload/collections/InterestRates";
import { PressReleases } from "./src/payload/collections/PressReleases";
import { ServiceFees } from "./src/payload/collections/ServiceFees";
import { AnnualReports } from "./src/payload/collections/AnnualReports";
import { StatutoryNotices } from "./src/payload/collections/StatutoryNotices";
import { LeadershipTeam } from "./src/payload/collections/LeadershipTeam";
import { CoopwakalaAgents } from "./src/payload/collections/CoopwakalaAgents";

import { Header } from "./src/payload/globals/Header";
import { Footer } from "./src/payload/globals/Footer";
import { Homepage } from "./src/payload/globals/Homepage";
import { SiteSettings } from "./src/payload/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: "users",
    // Brand the admin so it visibly reads as CoopBank, not generic Payload.
    // CSS is injected by importing it from the admin route's page.tsx — a
    // BrandStyles provider broke the SSR tree on 3.85, so going simpler.
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
    CoopwakalaAgents,
    WhistleblowerReports,
    Faqs,
    Auctions,
    InterestRates,
    PressReleases,
    ServiceFees,
    BankCharges,
    AnnualReports,
    StatutoryNotices,
    LeadershipTeam,
  ],
  globals: [Header, Footer, Homepage, SiteSettings],
  secret: process.env.PAYLOAD_SECRET || "spike-secret-not-for-prod",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  // Uploads land in GCS — files survive Cloud Run cold-starts and serve
  // globally via the public bucket. On Cloud Run the SDK picks up Application
  // Default Credentials from the runtime service account; locally it falls
  // back to gcloud auth.
  plugins: [
    gcsStorage({
      bucket: process.env.GCS_BUCKET || "coopbank-media",
      collections: {
        // disablePayloadAccessControl: media docs' `url` field becomes the
        // direct public GCS URL. Studio + public pages load images straight
        // from storage.googleapis.com — no more 404 on /api/media/file/*.
        media: { disablePayloadAccessControl: true },
      },
      enabled: Boolean(process.env.GCS_BUCKET),
      options: {
        projectId: process.env.GCS_PROJECT_ID || "sakura-group-482908",
      },
    }),
  ],
});
