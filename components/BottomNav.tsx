"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: CompassIcon },
  { href: "/log", label: "Log", icon: PlusIcon, primary: true },
  { href: "/postcards", label: "Postcards", icon: EnvelopeIcon },
  { href: "/profile", label: "You", icon: PersonIcon },
];

export function BottomNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-sand bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2">
        {TABS.map(({ href, label, icon: Icon, primary }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium ${
                  active ? "text-postbox" : "text-ink-soft"
                }`}
              >
                {primary ? (
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-postbox text-card shadow-md ring-4 ring-paper">
                    <Icon />
                  </span>
                ) : (
                  <Icon />
                )}
                <span>{label}</span>
                {href === "/postcards" && unread > 0 && (
                  <span className="absolute top-1 right-[calc(50%-1.1rem)] flex size-4 items-center justify-center rounded-full bg-postbox text-[0.6rem] font-bold text-card">
                    {unread}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function svgProps() {
  return {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}
function HomeIcon() {
  return (
    <svg {...svgProps()}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg {...svgProps()}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg {...svgProps()} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function EnvelopeIcon() {
  return (
    <svg {...svgProps()}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg {...svgProps()}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
