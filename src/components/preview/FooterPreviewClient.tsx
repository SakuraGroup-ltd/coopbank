"use client";
import { FooterView, type FooterData } from "@/components/layout/FooterView";
import { useDraftListener } from "./useDraftListener";

export default function FooterPreviewClient({ initial }: { initial: FooterData }) {
  const data = useDraftListener<FooterData>("footer", initial);
  return <FooterView {...data} />;
}
