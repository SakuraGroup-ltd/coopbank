"use client";
import { LeadershipGrid, type Person } from "@/components/about/LeadershipGrid";
import { useDraftListener } from "./useDraftListener";

export type LeadershipPreviewData = { intro: string; highlightCount: number; people: Person[] };

export default function LeadershipPreviewClient({ initial }: { initial: LeadershipPreviewData }) {
  const data = useDraftListener<LeadershipPreviewData>("leadership", initial);
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <LeadershipGrid intro={data.intro} people={data.people} highlightCount={data.highlightCount} />
    </div>
  );
}
