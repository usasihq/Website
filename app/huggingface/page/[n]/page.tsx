import { notFound } from "next/navigation";
import { HfRankPage, hfRankMetadata, hfRankParams } from "@/components/HfPages";
import { hfPageCount } from "@/lib/huggingface/items";

export const dynamicParams = false;

export function generateStaticParams() {
  return hfRankParams("model");
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  return hfRankMetadata("model", Number((await params).n));
}

export default async function HuggingFaceModelRankPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  if (!Number.isInteger(n) || n < 2 || n > hfPageCount("model")) notFound();
  return <HfRankPage kind="model" n={n} />;
}
