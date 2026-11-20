import { cx } from "@/lib/ccp/assets";
import { ICONS, INSTAGRAM_PATH, WORDMARK_PATHS, type IconName } from "@/lib/ccp/paths";

export type { IconName };

export type IconProps = {
  name: IconName;
  size?: number;
  /** Si se pasa, el ícono se anuncia con este nombre; si no, queda oculto para lectores de pantalla. */
  label?: string;
  className?: string;
};

export function Icon({ name, size = 24, label, className }: IconProps) {
  return (
    <svg
      className={cx("nc-icon", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? "" }}
    />
  );
}

export type WordmarkProps = { size?: "normal" | "small"; height?: number; className?: string };

export function Wordmark({ size = "normal", height, className }: WordmarkProps) {
  const small = size === "small";
  const hgt = height ?? (small ? 8 : 24);
  return (
    <svg
      className={cx("nc-wordmark", className)}
      viewBox="0 0 178 24"
      height={hgt}
      width={(hgt * 178) / 24}
      role="img"
      aria-label="nocturna"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="currentColor"
          stroke={small ? "currentColor" : undefined}
          strokeWidth={small ? 1 : undefined}
          strokeLinejoin={small ? "round" : undefined}
        />
      ))}
    </svg>
  );
}

export function CcpLockup({ className }: { className?: string }) {
  return <span className={cx("nc-lockup nc-t-title", className)}>Cero Consultas Perdidas</span>;
}

export type InstagramGlyphProps = { size?: number; color?: "white" | "black"; className?: string };

export function InstagramGlyph({ size = 32, color, className }: InstagramGlyphProps) {
  const fill = color === "white" ? "#FFFFFF" : color === "black" ? "#000000" : "currentColor";
  return (
    <svg className={cx("nc-ig", className)} width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Instagram">
      <path d={INSTAGRAM_PATH} fill={fill} />
    </svg>
  );
}

/** Filtros SVG Texture/Edge (borde rugoso de los trazos). Va una sola vez, en el layout de CCP. */
export function SvgDefs() {
  return (
    <div className="nc-defs" aria-hidden="true">
      <svg width="0" height="0">
        <filter id="nc-edge" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves={3} seed={0} />
          <feDisplacementMap in="SourceGraphic" scale={4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="nc-edge-s" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
