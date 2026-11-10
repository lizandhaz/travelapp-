import Link from "next/link";

export function PageHeader({
  title,
  kicker,
  back,
  children,
}: {
  title: string;
  kicker?: string;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="px-4 pt-6 pb-4">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-airmail">
          <span aria-hidden>←</span> {back.label}
        </Link>
      )}
      {kicker && (
        <p className="text-xs font-semibold tracking-[0.18em] text-postbox uppercase">{kicker}</p>
      )}
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {children}
      </div>
    </header>
  );
}
