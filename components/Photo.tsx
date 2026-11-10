/**
 * Placeholder "photo": a soft gradient with a caption, until real uploads exist.
 * Later this becomes a real image from Supabase Storage.
 */
export function Photo({
  palette,
  caption,
  className = "",
}: {
  palette: [string, string];
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm bg-sand ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
      role="img"
      aria-label={caption ?? "Holiday photo"}
    >
      <div className="paper-grain absolute inset-0 opacity-60" />
      {caption && (
        <span className="absolute bottom-2 left-2 rounded-sm bg-card/85 px-1.5 py-0.5 font-display text-xs italic text-ink">
          {caption}
        </span>
      )}
    </div>
  );
}
