import Link from "next/link";
import { Brain, Compass, Lock, Rocket, Scale, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import type { KidIcon as KidIconName, KidLesson } from "@/lib/kids";

const ICONS: Record<KidIconName, LucideIcon> = {
  sparkles: Sparkles,
  brain: Brain,
  rocket: Rocket,
  scale: Scale,
  lock: Lock,
  shield: ShieldCheck,
  compass: Compass,
};

/** Lesson colors cycle through the site's accent family so cards are easy to tell apart. */
const TINTS = [
  "from-[#4cc9ff]/25 to-[#2f6bff]/10 text-[#7ad7ff]",
  "from-[#a78bfa]/25 to-[#6d28d9]/10 text-[#c4b5fd]",
  "from-[#34d399]/25 to-[#047857]/10 text-[#6ee7b7]",
  "from-[#fbbf24]/25 to-[#b45309]/10 text-[#fcd34d]",
  "from-[#f472b6]/25 to-[#be185d]/10 text-[#f9a8d4]",
  "from-[#60a5fa]/25 to-[#1d4ed8]/10 text-[#93c5fd]",
  "from-[#2dd4bf]/25 to-[#0f766e]/10 text-[#5eead4]",
];

export const kidTint = (n: number) => TINTS[(n - 1) % TINTS.length];

export function KidIcon({ name, className = "h-6 w-6" }: { name: KidIconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" className={className} />;
}

export function KidLessonCard({ lesson }: { lesson: KidLesson }) {
  return (
    <Link
      prefetch={false}
      href={`/kids/${lesson.slug}/`}
      className="card card-link group flex h-full flex-col gap-4 rounded-2xl p-5"
      data-testid="kid-lesson-card"
    >
      <span className="flex items-center justify-between gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${kidTint(lesson.number)}`}>
          <KidIcon name={lesson.icon} />
        </span>
        <span className="font-mono text-sm text-muted">
          Lesson {lesson.number} · {lesson.minutes} min
        </span>
      </span>
      <span>
        <span className="block text-xl font-semibold leading-snug text-text group-hover:text-white">{lesson.title}</span>
        <span className="mt-1.5 block text-[1.0625rem] text-muted">{lesson.question}</span>
      </span>
    </Link>
  );
}
