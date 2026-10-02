import type { ComponentType } from "react";
import AgentsRobotics from "@/content/pages/learn-agents-robotics.mdx";
import Ecosystem from "@/content/pages/learn-ecosystem.mdx";
import Evaluations from "@/content/pages/learn-evaluations.mdx";
import HostedOrLocal from "@/content/pages/learn-hosted-or-local.mdx";
import InferenceHardware from "@/content/pages/learn-inference-hardware.mdx";
import InfrastructureClaims from "@/content/pages/learn-infrastructure-claims.mdx";
import ModelCard from "@/content/pages/learn-model-card.mdx";
import OpenWeight from "@/content/pages/learn-open-weight.mdx";
import PolicySources from "@/content/pages/learn-policy-sources.mdx";
import TrainingData from "@/content/pages/learn-training-data.mdx";

/** Explainer slug → compiled MDX (static imports so every page is exported). */
export const EXPLAINER_CONTENT: Record<string, ComponentType> = {
  "open-weight-vs-open-source": OpenWeight,
  "how-to-read-a-model-card": ModelCard,
  "hosted-or-local": HostedOrLocal,
  "inference-hardware": InferenceHardware,
  "reading-evaluations": Evaluations,
  "training-data-disclosures": TrainingData,
  "how-the-ecosystem-fits-together": Ecosystem,
  "agents-and-robotics": AgentsRobotics,
  "infrastructure-and-energy-claims": InfrastructureClaims,
  "policy-and-standards-sources": PolicySources,
};
