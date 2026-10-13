/**
 * The People directory (/people/): one list of every published profile — the
 * Person profiles (/people/<slug>/) and the People Behind Big SI leaders
 * (/big-si/<slug>/) — with labels and URL-state filters. Client-safe.
 */
import { PERSON_GROUPS, PERSON_SECTORS, PERSON_SPECIALTIES, WORK_TYPES, type PersonGroup, type PersonSector, type PersonSpecialty, type WorkType } from "./schema";
import { normalize } from "./search";

export const PERSON_GROUP_LABELS: Record<PersonGroup, string> = {
  leadership: "Founders and executives",
  engineering: "Engineers and researchers",
  "open-source": "Open-source maintainers",
  local: "Local SI",
};

export const PERSON_SECTOR_LABELS: Record<PersonSector, string> = {
  corporate: "Company",
  academic: "University",
  nonprofit: "Nonprofit",
  government: "Government lab or agency",
  independent: "Independent",
};

export const PERSON_SPECIALTY_LABELS: Record<PersonSpecialty, string> = {
  "language-models": "Language models",
  multimodal: "Multimodal models",
  vision: "Computer vision",
  "generative-media": "Image, video, and 3D generation",
  "speech-audio": "Speech and audio",
  robotics: "Robotics",
  "reinforcement-learning": "Reinforcement learning",
  agents: "Agents",
  inference: "Inference and serving",
  "training-systems": "Training systems",
  "ml-frameworks": "ML frameworks and libraries",
  hardware: "Chips and hardware",
  "developer-tools": "Developer tools",
  evaluation: "Evaluation and benchmarks",
  "safety-alignment": "Safety and alignment",
  interpretability: "Interpretability",
  "ai-for-science": "AI for science",
  data: "Datasets and data",
  education: "Teaching and writing",
  "ml-theory": "Machine-learning theory",
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  "open-source": "Open-source code",
  "open-weights": "Open weights",
  "open-data": "Open data",
  "open-research": "Published research",
  proprietary: "Proprietary product",
};

/** One row of the directory: a Person profile or a Big SI leader. */
export type PeopleListItem = {
  slug: string;
  name: string;
  initials: string;
  href: string;
  headline: string;
  /** "leader" profiles are the longer People Behind Big SI career profiles. */
  kind: "person" | "leader";
  groups: PersonGroup[];
  sector: PersonSector | null;
  specialties: PersonSpecialty[];
  /** Current roles first: the organization's catalog slug (when it has a record) and name. */
  organizations: { slug: string | null; name: string; role: string; current: boolean }[];
  workTypes: WorkType[];
  /** Names of the person's catalogued and other listed work, for search. */
  work: string[];
};

export const DEFAULT_PEOPLE_FILTERS = { q: "", group: "" as PersonGroup | "", sector: "" as PersonSector | "", specialty: "" as PersonSpecialty | "", org: "", type: "" as WorkType | "" };
export type PeopleFilters = typeof DEFAULT_PEOPLE_FILTERS;

const pick = <T extends string>(value: string | null, values: readonly T[]): T | "" => (value && (values as readonly string[]).includes(value) ? (value as T) : "");

export function parsePeopleFilters(p: URLSearchParams): PeopleFilters {
  return {
    q: (p.get("q") ?? "").trim().slice(0, 120),
    group: pick(p.get("group"), PERSON_GROUPS),
    sector: pick(p.get("sector"), PERSON_SECTORS),
    specialty: pick(p.get("specialty"), PERSON_SPECIALTIES),
    org: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.get("org") ?? "") ? p.get("org")!.slice(0, 80) : "",
    type: pick(p.get("type"), WORK_TYPES),
  };
}

export function serializePeopleFilters(f: PeopleFilters): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  return p.toString();
}

export const activePeopleFilters = (f: PeopleFilters) => Object.values(f).filter(Boolean).length;

/** Every query word must appear in the name, headline, organizations, or work. */
export function filterPeople(items: PeopleListItem[], f: PeopleFilters): PeopleListItem[] {
  const words = normalize(f.q).split(/\s+/).filter(Boolean);
  return items.filter((i) => {
    if (f.group && !i.groups.includes(f.group)) return false;
    if (f.sector && i.sector !== f.sector) return false;
    if (f.specialty && !i.specialties.includes(f.specialty)) return false;
    if (f.org && !i.organizations.some((o) => o.slug === f.org)) return false;
    if (f.type && !i.workTypes.includes(f.type)) return false;
    if (!words.length) return true;
    const text = normalize([i.name, i.headline, ...i.organizations.map((o) => `${o.name} ${o.role}`), ...i.work].join(" "));
    return words.every((w) => text.includes(w));
  });
}

/** "Founders and executives at Meta" style heading for a filtered view. */
export function peopleViewLabel(f: PeopleFilters, orgName: string | null): string {
  const what = f.group ? PERSON_GROUP_LABELS[f.group] : "People";
  return orgName ? `${what} · ${orgName}` : what;
}
