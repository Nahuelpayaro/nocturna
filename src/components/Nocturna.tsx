type NocturnaProps = {
  /** Pass-through classes — set font-size here; the wordmark scales from it. */
  className?: string;
  /** Show the "estudio creativo" descriptor under the name (for standalone use). */
  showSubtitle?: boolean;
};

/**
 * The wordmark: "nocturna" set in Unbounded Bold. The eye is no longer baked
 * into the "o" — it now lives as a separate isotype (header, preloader). Sized
 * in `em` so the whole mark scales from the font-size set on `className`.
 */
export function Nocturna({ className, showSubtitle = false }: NocturnaProps) {
  return (
    <span className={`inline-flex flex-col leading-none ${className ?? ""}`}>
      <span className="font-wordmark font-bold lowercase tracking-tight">
        nocturna
      </span>
      {showSubtitle && (
        <span className="mt-[0.55em] font-mono text-[0.2em] uppercase tracking-[0.45em] text-gris">
          estudio creativo
        </span>
      )}
    </span>
  );
}
