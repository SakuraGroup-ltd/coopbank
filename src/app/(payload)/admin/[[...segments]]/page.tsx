/* eslint-disable @typescript-eslint/no-explicit-any */
// Importing the brand CSS from the admin's server-component page guarantees
// Next.js bundles it into the route's CSS chunks. The (payload) layout-level
// import gets dropped because Payload's RootLayout builds its own document.
import "../../../../payload/components/brand.css";
import type { Metadata } from "next";
import config from "../../../../../payload.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap.js";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
