import { useId } from "react";

/**
 * A round ink postmark showing where and when a trip happened.
 * Always the trip month, never a live date or location.
 */
export function Postmark({
  place,
  date,
  size = 88,
  waves = true,
  className = "",
}: {
  place: string;
  date: string;
  size?: number;
  waves?: boolean;
  className?: string;
}) {
  const id = useId();
  const top = `${id}-top`;
  const width = waves ? size * 1.9 : size;

  return (
    <svg
      viewBox={`0 0 ${waves ? 168 : 88} 88`}
      width={width}
      height={size}
      role="img"
      aria-label={`Postmarked ${place}, ${date}`}
      className={`text-airmail opacity-80 ${className}`}
      style={{ transform: "rotate(-8deg)" }}
    >
      <defs>
        <path id={top} d="M 14,44 A 30,30 0 0 1 74,44" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="44" cy="44" r="40" strokeWidth="2" />
        <circle cx="44" cy="44" r="23" strokeWidth="1" />
        {waves &&
          [30, 40, 50, 60].map((y) => (
            <path
              key={y}
              d={`M 86,${y} q 10,-6 20,0 t 20,0 t 20,0 t 20,0`}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
      </g>
      <text fill="currentColor" fontSize="8.5" fontWeight="700" letterSpacing="1.2">
        <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">
          {place.toUpperCase()}
        </textPath>
      </text>
      <text
        x="44"
        y="47.5"
        fill="currentColor"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        {date.toUpperCase()}
      </text>
      <text x="44" y="75" fill="currentColor" fontSize="7" fontWeight="700" textAnchor="middle" letterSpacing="2">
        ★ POSTCARD ★
      </text>
    </svg>
  );
}
