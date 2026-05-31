/* eslint-disable @next/next/no-img-element */
import type { JSX } from "react";

type Block = { blockType: string; [k: string]: unknown };

type MediaRef = { url?: string; alt?: string } | string | null | undefined;

const mediaUrl = (m: MediaRef): string | undefined => {
  if (!m) return undefined;
  if (typeof m === "string") return m;
  return m.url;
};

const mediaAlt = (m: MediaRef): string => {
  if (!m || typeof m === "string") return "";
  return m.alt || "";
};

function HeroRender({ block }: { block: Block }) {
  const image = block.image as MediaRef;
  return (
    <section className="relative bg-[#0F3D7A] text-white py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          {(block.eyebrow as string) && (
            <p className="text-[#1A8A3A] text-sm font-semibold uppercase tracking-widest mb-3">
              {block.eyebrow as string}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {block.headline as string}
          </h1>
          {(block.subhead as string) && (
            <p className="text-white/80 text-lg mb-6">{block.subhead as string}</p>
          )}
          <div className="flex gap-3">
            {Array.isArray(block.ctas) &&
              (block.ctas as Array<{ label: string; href: string; style?: string }>).map(
                (cta, i) => (
                  <a
                    key={i}
                    href={cta.href}
                    className={
                      cta.style === "secondary"
                        ? "border-2 border-white px-5 py-2.5 rounded font-semibold hover:bg-white hover:text-[#0F3D7A] transition"
                        : "bg-[#1A8A3A] px-5 py-2.5 rounded font-semibold hover:bg-[#14692D] transition"
                    }
                  >
                    {cta.label}
                  </a>
                ),
              )}
          </div>
        </div>
        {mediaUrl(image) && (
          <img src={mediaUrl(image)} alt={mediaAlt(image)} className="rounded-lg w-full" />
        )}
      </div>
    </section>
  );
}

function RichTextRender({ block }: { block: Block }) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 prose prose-lg">
      <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
        {JSON.stringify(block.content, null, 2)}
      </pre>
    </section>
  );
}

function FallbackRender({ block }: { block: Block }) {
  return (
    <section className="border border-dashed border-gray-300 p-6 my-2 mx-6 rounded bg-gray-50">
      <p className="font-mono text-xs text-gray-500 uppercase">{block.blockType}</p>
      <pre className="text-xs mt-2 overflow-x-auto">{JSON.stringify(block, null, 2)}</pre>
    </section>
  );
}

const renderers: Record<string, (props: { block: Block }) => JSX.Element> = {
  hero: HeroRender,
  "rich-text": RichTextRender,
};

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!Array.isArray(blocks)) return null;
  return (
    <>
      {blocks.map((b, i) => {
        const Renderer = renderers[b.blockType] || FallbackRender;
        return <Renderer key={i} block={b} />;
      })}
    </>
  );
}
