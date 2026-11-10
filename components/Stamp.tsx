/**
 * A score shown as a perforated postage stamp. Scores are always out of 10.
 * Colour follows the score: 8+ sea green, 6-7.9 airmail blue, under 6 postbox red.
 */
export function Stamp({
  score,
  label,
  size = "md",
  tilt = 0,
}: {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  tilt?: number;
}) {
  const tone = score >= 8 ? "text-sea" : score >= 6 ? "text-airmail" : "text-postbox";
  const dims = {
    sm: "w-12 h-14 text-lg",
    md: "w-16 h-[4.5rem] text-2xl",
    lg: "w-24 h-28 text-4xl",
  }[size];
  const shown = Number.isInteger(score) ? String(score) : score.toFixed(1);

  return (
    <div
      className="stamp-shadow inline-block shrink-0"
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
      role="img"
      aria-label={`${label ? label + ": " : ""}${shown} out of 10`}
    >
      <div className="stamp">
        <div className={`stamp-inner ${tone} ${dims} flex flex-col items-center justify-center`}>
          <span className="font-display font-bold leading-none">{shown}</span>
          <span className="mt-0.5 text-[0.55rem] font-semibold tracking-[0.15em] uppercase">
            {label ?? "/ 10"}
          </span>
        </div>
      </div>
    </div>
  );
}
