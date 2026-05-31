// Live Preview target route. Payload's admin iframes /preview/<slug> when an
// editor opens Live Preview; this page fetches the matching Page by slug and
// renders its blocks through the client preview wrapper that listens for
// postMessage updates to give WYSIWYG editing inside the admin.
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import PreviewClient from "@/components/preview/PreviewClient";

type Args = { params: Promise<{ slug?: string[] }> };

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: Args) {
  const { slug = [] } = await params;
  const path = slug.length ? slug.join("/") : "home";
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: path } },
    limit: 1,
    draft: true,
    depth: 2,
  });
  const page = result.docs[0];
  if (!page) return notFound();

  return (
    <PreviewClient
      initialData={page as never}
      serverURL={process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}
    />
  );
}
