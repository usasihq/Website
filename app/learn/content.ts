import type { ComponentType } from "react";
import AgentsRobotics from "@/content/pages/learn-agents-robotics.mdx";
import AiAndYourData from "@/content/pages/learn-ai-and-your-data.mdx";
import AiContentProvenance from "@/content/pages/learn-ai-content-provenance.mdx";
import AiHistory from "@/content/pages/learn-ai-history.mdx";
import CareersInAi from "@/content/pages/learn-careers-in-ai.mdx";
import Ecosystem from "@/content/pages/learn-ecosystem.mdx";
import Evaluations from "@/content/pages/learn-evaluations.mdx";
import HostedOrLocal from "@/content/pages/learn-hosted-or-local.mdx";
import HowLanguageModelsWork from "@/content/pages/learn-how-language-models-work.mdx";
import HowModelsUseTools from "@/content/pages/learn-how-models-use-tools.mdx";
import InferenceHardware from "@/content/pages/learn-inference-hardware.mdx";
import InfrastructureClaims from "@/content/pages/learn-infrastructure-claims.mdx";
import ModelCard from "@/content/pages/learn-model-card.mdx";
import MultimodalModels from "@/content/pages/learn-multimodal-models.mdx";
import OpenWeight from "@/content/pages/learn-open-weight.mdx";
import PolicySources from "@/content/pages/learn-policy-sources.mdx";
import PretrainingAndPostTraining from "@/content/pages/learn-pretraining-and-post-training.mdx";
import Quantization from "@/content/pages/learn-quantization.mdx";
import RetrievalAugmentedGeneration from "@/content/pages/learn-retrieval-augmented-generation.mdx";
import SafetyTestingAndFrameworks from "@/content/pages/learn-safety-testing-and-frameworks.mdx";
import TokensAndContextWindows from "@/content/pages/learn-tokens-and-context-windows.mdx";
import TrainingData from "@/content/pages/learn-training-data.mdx";

/** Explainer slug → compiled MDX (static imports so every page is exported). */
export const EXPLAINER_CONTENT: Record<string, ComponentType> = {
  "how-language-models-work": HowLanguageModelsWork,
  "tokens-and-context-windows": TokensAndContextWindows,
  "multimodal-models": MultimodalModels,
  "ai-history": AiHistory,
  "open-weight-vs-open-source": OpenWeight,
  "how-to-read-a-model-card": ModelCard,
  "pretraining-and-post-training": PretrainingAndPostTraining,
  "training-data-disclosures": TrainingData,
  "hosted-or-local": HostedOrLocal,
  "how-models-use-tools": HowModelsUseTools,
  "agents-and-robotics": AgentsRobotics,
  "retrieval-augmented-generation": RetrievalAugmentedGeneration,
  "inference-hardware": InferenceHardware,
  "quantization": Quantization,
  "ai-content-provenance": AiContentProvenance,
  "reading-evaluations": Evaluations,
  "safety-testing-and-frameworks": SafetyTestingAndFrameworks,
  "how-the-ecosystem-fits-together": Ecosystem,
  "careers-in-ai": CareersInAi,
  "infrastructure-and-energy-claims": InfrastructureClaims,
  "ai-and-your-data": AiAndYourData,
  "policy-and-standards-sources": PolicySources,
};
