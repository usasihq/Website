import { notFound } from "next/navigation";
import { HfItemPage, hfItemMetadata } from "@/components/HfPages";
import { hfDatasetEntries, hfDatasetEntry } from "@/lib/huggingface/items";

export const dynamicParams = false;

export function generateStaticParams() {
  return hfDatasetEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = hfDatasetEntry((await params).slug);
  return e ? hfItemMetadata(e) : {};
}

export default async function HuggingFaceDatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = hfDatasetEntry((await params).slug);
  if (!e) notFound();
  return <HfItemPage e={e} />;
}
