import { HfIndexPage, hfIndexMetadata } from "@/components/HfPages";

export const metadata = hfIndexMetadata("model");

export default function HuggingFaceModelsPage() {
  return <HfIndexPage kind="model" />;
}
