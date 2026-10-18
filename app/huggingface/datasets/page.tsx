import { HfIndexPage, hfIndexMetadata } from "@/components/HfPages";

export const metadata = hfIndexMetadata("dataset");

export default function HuggingFaceDatasetsPage() {
  return <HfIndexPage kind="dataset" />;
}
