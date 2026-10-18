import { notFound } from "next/navigation";
import { HfRankPage, hfRankMetadata, hfRankParams } from "@/components/HfPages";
import { hfPageCount } from "@/lib/huggingface/items";

export const dynamicParams = false;

export function generateStaticParams() {
  return hfRankParams("dataset");
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  return hfRankMetadata("dataset", Number((await params).n));
}

export default async function HuggingFaceDatasetRankPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 2 || n > hfPageCount("dataset")) notFound();
  return <HfRankPage kind="dataset" n={n} />;
}
