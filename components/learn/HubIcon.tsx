import { Bot, Boxes, Briefcase, Code2, Cog, Cpu, Database, FlaskConical, Gauge, HardDrive, Landmark, ShieldCheck, Waves, type LucideIcon } from "lucide-react";

const HUB_ICONS: Record<string, LucideIcon> = {
  "local-ai": HardDrive,
  agents: Bot,
  "chips-and-compute": Cpu,
  "open-source-foundations": Landmark,
  science: FlaskConical,
  "foundation-models": Boxes,
  robotics: Cog,
  evaluation: Gauge,
  "enterprise-ai": Briefcase,
  "data-and-datasets": Database,
  "safety-and-security": ShieldCheck,
  "developer-tools": Code2,
  "speech-vision-and-multimodal": Waves,
};

/** A decorative icon for a hub; unknown hubs get a neutral default. */
export function HubIcon({ slug, className = "h-5 w-5" }: { slug: string; className?: string }) {
  const Icon = HUB_ICONS[slug] ?? Boxes;
  return <Icon aria-hidden="true" className={className} />;
}
