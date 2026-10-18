import { notFound } from "next/navigation";
import { HfItemPage, hfItemMetadata } from "@/components/HfPages";
import { hfModelEntries, hfModelEntry } from "@/lib/huggingface/items";

export const dynamicParams = false;

export function generateStaticParams() {
  return hfModelEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = hfModelEntry((await params).slug);
  return e ? hfItemMetadata(e) : {};
}

export default async function HuggingFaceModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = hfModelEntry((await params).slug);
  if (!e) notFound();
  return <HfItemPage e={e} />;
}
