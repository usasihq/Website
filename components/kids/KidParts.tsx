import Link from "@/components/Link";
import { Brain, CircleCheck, Compass, ListChecks, Lock, NotebookPen, Rocket, Scale, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { InlineText } from "@/components/InlineText";
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
  "from-[#4cc9ff]/25 to-[#2f6bff]/10 text-tone-sky-2",
  "from-[#a78bfa]/25 to-[#6d28d9]/10 text-tone-violet",
  "from-[#34d399]/25 to-[#047857]/10 text-tone-green",
  "from-[#fbbf24]/25 to-[#b45309]/10 text-tone-amber",
  "from-[#f472b6]/25 to-[#be185d]/10 text-tone-pink",
  "from-[#60a5fa]/25 to-[#1d4ed8]/10 text-tone-blue",
  "from-[#2dd4bf]/25 to-[#0f766e]/10 text-tone-teal",
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
        <span className="block text-xl font-semibold leading-snug text-text group-hover:text-strong">{lesson.title}</span>
        <span className="mt-1.5 block text-[1.0625rem] text-muted">{lesson.question}</span>
      </span>
    </Link>
  );
}

const LETTERS = "ABCDEFGH";

/** The lesson's reading: sections, the activity, and the "Remember" list. */
export function KidLessonBody({ lesson: l, level = 2 }: { lesson: KidLesson; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  const id = (part: string) => (level === 2 ? part : `${l.slug}-${part}`);
  return (
    <>
      <div className="max-w-2xl space-y-9 text-[1.1875rem] leading-relaxed text-body">
        {l.sections.map((s, i) => (
          <section key={s.heading} aria-labelledby={id(`part-${i}`)}>
            <H id={id(`part-${i}`)} className="text-2xl font-semibold text-text">
              {s.heading}
            </H>
            {s.paragraphs.map((p, pi) => (
              <p key={pi} className="mt-3">
                <InlineText text={p} />
              </p>
            ))}
            {s.bullets ? (
              <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-cyan">
                {s.bullets.map((b, bi) => (
                  <li key={bi}>
                    <InlineText text={b} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <section aria-labelledby={id("try-heading")} className="max-w-2xl rounded-2xl border border-tone-green/40 bg-tone-green/7 p-6">
        <H id={id("try-heading")} className="flex items-center gap-2 text-2xl font-semibold text-text">
          <NotebookPen aria-hidden="true" className="h-6 w-6 text-tone-green" />
          Try this: {l.tryThis.title}
        </H>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-[1.1875rem] leading-relaxed text-body marker:font-semibold marker:text-tone-green">
          {l.tryThis.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby={id("remember-heading")} className="max-w-2xl rounded-2xl border border-line-strong bg-cyan/6 p-6">
        <H id={id("remember-heading")} className="flex items-center gap-2 text-2xl font-semibold text-text">
          <ListChecks aria-hidden="true" className="h-6 w-6 text-cyan" />
          Remember
        </H>
        <ul className="mt-4 space-y-3 text-[1.1875rem] leading-relaxed text-body">
          {l.remember.map((r, i) => (
            <li key={i} className="flex gap-3">
              <CircleCheck aria-hidden="true" className="mt-1 h-5 w-5 flex-none text-cyan" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** The quiz as a paper worksheet: lettered choices with a circle to fill in. */
export function KidQuizSheet({ lesson: l, level = 2 }: { lesson: KidLesson; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <section aria-label={`Quiz: ${l.title}`} className="max-w-2xl">
      <H className="text-2xl font-semibold text-text">Quick quiz</H>
      <p className="mt-1 text-muted">Circle the best answer.</p>
      <ol className="mt-4 space-y-5">
        {l.quiz.map((q, i) => (
          <li key={i}>
            <p className="font-semibold text-text">
              {i + 1}. {q.prompt}
            </p>
            <ul className="mt-2 space-y-1.5 pl-5">
              {q.choices.map((c, ci) => (
                <li key={ci} className="flex items-baseline gap-2">
                  <span aria-hidden="true" className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-line-strong font-mono text-xs">
                    {LETTERS[ci]}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Answers for printed quizzes, for the grown-up. */
export function KidAnswerKey({ lessons, level = 2 }: { lessons: KidLesson[]; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <section aria-label="Answer key" className="max-w-2xl break-before-page">
      <H className="text-2xl font-semibold text-text">Answer key</H>
      {lessons.map((l) => (
        <div key={l.slug} className="mt-4">
          {lessons.length > 1 ? (
            <p className="font-semibold text-text">
              Lesson {l.number}: {l.title}
            </p>
          ) : null}
          <ol className="mt-1 space-y-1 pl-5 text-[0.9375rem]">
            {l.quiz.map((q, i) => (
              <li key={i}>
                {i + 1}. {LETTERS[q.answer]}, {q.choices[q.answer]}. <span className="text-muted">{q.explanation}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
