import type { Person } from "@/lib/data";

const BG: Record<Person["colour"], string> = {
  postbox: "bg-postbox",
  airmail: "bg-airmail",
  sea: "bg-sea",
  sun: "bg-sun",
  ink: "bg-ink",
};

const SIZE = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-20 text-2xl",
};

export function Avatar({ person, size = "md" }: { person: Person; size?: keyof typeof SIZE }) {
  return (
    <span
      aria-hidden
      className={`${BG[person.colour]} ${SIZE[size]} inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-card`}
    >
      {person.initials}
    </span>
  );
}
