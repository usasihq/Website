import Link from "next/link";
import { Building2, Clock, Cpu, Landmark, Lightbulb, Scale, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Explainer, Level, TopicId } from "@/lib/learn";
import { topic as topicById } from "@/lib/learn";

export const TOPIC_ICONS: Record<TopicId, LucideIcon> = {
  basics: Lightbulb,
  "models-and-licenses": Scale,
  "running-ai": Cpu,
  evidence: ShieldCheck,
  industry: Building2,
  policy: Landmark,
};

export function TopicIcon({ id, className = "h-5 w-5" }: { id: TopicId; className?: string }) {
  const Icon = TOPIC_ICONS[id];
  return <Icon aria-hidden="true" className={className} />;
}

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`badge ${level === "Beginner" ? "border-cyan/40 text-cyan" : "border-ice/30 text-ice"}`}>
      {level}
    </span>
  );
}

export function ReadingTime({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted">
      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
      {minutes} min read
    </span>
  );
}

/** A linked card for one explainer; used on the Learn page, path pages, and "Keep learning". */
export function ExplainerCard({ e, minutes, showTopic = false }: { e: Explainer; minutes: number; showTopic?: boolean }) {
  return (
    <Link prefetch={false} href={`/learn/${e.slug}/`} className="card card-link group flex h-full flex-col p-5">
      {showTopic ? (
        <span className="eyebrow flex items-center gap-1.5 text-[0.6875rem]">
          <TopicIcon id={e.topic} className="h-3.5 w-3.5" />
          {topicById(e.topic).title}
        </span>
      ) : null}
      <span className={`${showTopic ? "mt-2" : ""} font-semibold leading-snug text-text group-hover:text-white`}>{e.title}</span>
      <span className="mt-1.5 text-sm text-muted">{e.question}</span>
      <span className="mt-auto flex flex-wrap items-center gap-3 pt-4">
        <LevelBadge level={e.level} />
        <ReadingTime minutes={minutes} />
      </span>
    </Link>
  );
}
