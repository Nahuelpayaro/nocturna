import type { CSSProperties, ElementType, ReactNode } from "react";
import Image from "next/image";
import { asset, cx, pad2 } from "@/lib/ccp/assets";

/* ---------- Recursos gráficos: SVG usados como máscara, toman color-fg o color-accent ---------- */

type GraphicColor = "fg" | "accent";

type MaskGraphicProps = {
  src: string;
  width: number;
  height: number;
  color?: GraphicColor;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

export function MaskGraphic({ src, width, height, color = "fg", className, style, label }: MaskGraphicProps) {
  const url = `url(${asset(src)})`;
  return (
    <span
      className={cx("nc-graphic", className)}
      style={{
        width,
        height,
        WebkitMaskImage: url,
        maskImage: url,
        backgroundColor: color === "accent" ? "var(--color-accent)" : "var(--color-fg)",
        ...style,
      }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

const slug = (s: string) => s.toLowerCase().replace(/ /g, "-");

type GraphicBase = { className?: string; style?: CSSProperties };

export type MarkType = "box" | "check" | "check-in-circle" | "circle" | "circle-arrow" | "corner-arrow" | "cross" | "cross-in-box";

export function Mark({ type = "check", variant = 1, size = 96, className, style }: GraphicBase & { type?: MarkType; variant?: number; size?: number }) {
  return <MaskGraphic src={`Marcas/mark-${slug(type)}-${pad2(variant)}.svg`} width={size} height={size} className={className} style={style} />;
}

const UNDERLINE_H: Record<number, number> = { 1: 36, 2: 44, 3: 17, 4: 41, 5: 47, 6: 29 };

export function Underline({ variant = 2, width = 480, color = "accent", className, style }: GraphicBase & { variant?: 1 | 2 | 3 | 4 | 5 | 6; width?: number; color?: GraphicColor }) {
  return <MaskGraphic src={`Trazos/underline-${pad2(variant)}.svg`} width={width} height={Math.round((width * UNDERLINE_H[variant]) / 480)} color={color} className={className} style={style} />;
}

const BRUSH_H: Record<number, number> = { 1: 122, 2: 122, 3: 88 };

export function Brush({ variant = 1, width = 480, color = "accent", className, style }: GraphicBase & { variant?: 1 | 2 | 3; width?: number; color?: GraphicColor }) {
  return <MaskGraphic src={`Trazos/brush-${pad2(variant)}.svg`} width={width} height={Math.round((width * BRUSH_H[variant]) / 480)} color={color} className={className} style={style} />;
}

const SCRIBBLE: Record<string, [number, number]> = { ball: [240, 127], "cross-out": [240, 102], loops: [280, 116] };

export function Scribble({ variant = "ball", width, className, style }: GraphicBase & { variant?: "ball" | "cross-out" | "loops"; width?: number }) {
  const d = SCRIBBLE[variant];
  const w = width ?? d[0];
  return <MaskGraphic src={`Garabatos/scribble-${variant}.svg`} width={w} height={Math.round((w * d[1]) / d[0])} className={className} style={style} />;
}

const CROSS: Record<number, [number, number]> = { 1: [211, 200], 2: [176, 200] };

export function Cross({ variant = 1, height = 200, className, style }: GraphicBase & { variant?: 1 | 2; height?: number }) {
  const d = CROSS[variant];
  return <MaskGraphic src={`Garabatos/cross-brush-${pad2(variant)}.svg`} width={Math.round((height * d[0]) / d[1])} height={height} className={className} style={style} />;
}

const HAND: Record<string, [number, number]> = {
  "covering-face": [186, 200],
  pointing: [231, 200],
  "pointing-up": [177, 200],
  "thumbs-up": [210, 200],
  "open-hands": [366, 200],
  "holding-phone": [160, 200],
};

export type HandGesture = "covering-face" | "pointing" | "pointing-up" | "thumbs-up" | "open-hands" | "holding-phone";

export function Hand({ gesture = "pointing", height = 200, className, style }: GraphicBase & { gesture?: HandGesture; height?: number }) {
  const d = HAND[gesture];
  return <MaskGraphic src={`Manos/hand-${gesture}.svg`} width={Math.round((height * d[0]) / d[1])} height={height} className={className} style={style} />;
}

/* ---------- Resaltador y titulares ---------- */

export function Highlight({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx("nc-hl", className)} style={style}>
      <span className="nc-hl__bg" aria-hidden="true" />
      <span className="nc-hl__text">{children}</span>
    </span>
  );
}

export type HeadlineSize = "display-poster" | "display-xl" | "display-l" | "heading";

export type HeadlineLines = {
  title?: ReactNode;
  highlight?: ReactNode;
  /** Segunda línea resaltada: en el DS solo se muestra con showHighlight2. */
  highlight2?: ReactNode;
  after?: ReactNode;
  showHighlight?: boolean;
  showHighlight2?: boolean;
};

export type HeadlineProps = HeadlineLines & {
  size?: HeadlineSize;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Cortes distintos en Mobile (el Figma parte el resaltado en dos líneas). Se alternan con CSS. */
  mobile?: HeadlineLines;
  /** Para mover el foco al titular cuando aparece (con tabIndex -1). */
  id?: string;
  tabIndex?: number;
};

function headlineLines({ title, highlight, highlight2, after, showHighlight = true, showHighlight2 = false }: HeadlineLines) {
  return (
    <>
      {title ? <span className="nc-headline__plain">{title}</span> : null}
      {highlight && showHighlight ? (
        <span className="nc-headline__line">
          <Highlight>{highlight}</Highlight>
        </span>
      ) : null}
      {highlight2 && showHighlight2 ? (
        <span className="nc-headline__line">
          <Highlight>{highlight2}</Highlight>
        </span>
      ) : null}
      {after ? <span className="nc-headline__plain">{after}</span> : null}
    </>
  );
}

export function Headline({ size = "display-xl", as: Tag = "h2", className, style, mobile, id, tabIndex, ...lines }: HeadlineProps) {
  return (
    <Tag id={id} tabIndex={tabIndex} className={cx("nc-headline", `nc-t-${size}`, className)} style={style}>
      {mobile ? (
        <>
          <span className="nc-only-desktop nc-contents">{headlineLines(lines)}</span>
          <span className="nc-only-mobile nc-contents">{headlineLines({ ...lines, ...mobile })}</span>
        </>
      ) : (
        headlineLines(lines)
      )}
    </Tag>
  );
}

/* ---------- Recorrido numerado: ruta en S con 4 paradas (Graphic/Path) ---------- */

export function Path({
  labels = ["Consulta", "Respuesta", "Seguimiento", "Visita"],
  showLabels = true,
  width = 720,
  className,
}: {
  labels?: string[];
  showLabels?: boolean;
  width?: number;
  className?: string;
}) {
  const stops = [
    [56, 200],
    [250, 90],
    [470, 230],
    [664, 100],
  ];
  const tx = [
    [44, 228],
    [238, 18],
    [458, 258],
    [652, 128],
  ];
  return (
    <svg
      className={cx("nc-path", className)}
      viewBox="0 0 720 320"
      width={width}
      height={(width * 320) / 720}
      role="img"
      aria-label={`Recorrido: ${labels.join(", ")}`}
    >
      <path
        d="M56 200 C150 120 200 85 250 90 C330 95 380 230 470 230 C560 230 600 140 664 100"
        fill="none"
        stroke="var(--color-fg)"
        strokeWidth={8}
        strokeLinecap="round"
        filter="url(#nc-edge-s)"
      />
      {stops.map((s, i) => (
        <circle key={`c${i}`} cx={s[0]} cy={s[1]} r={11} fill="var(--color-bg)" stroke="var(--color-fg)" strokeWidth={6} filter="url(#nc-edge-s)" />
      ))}
      {tx.map((t, i) => (
        <g key={`t${i}`}>
          <text x={t[0]} y={t[1] + 20} className="nc-path__num">
            {pad2(i + 1)}
          </text>
          {showLabels ? (
            <text x={t[0]} y={t[1] + 44} className="nc-path__label">
              {labels[i]}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/* ---------- Agente CCP: símbolo (sombrero y ojos) y poses de referencia ---------- */

export function Agent({ surface = "light", width = 260, className, style }: GraphicBase & { surface?: "light" | "dark"; width?: number }) {
  const dark = surface === "dark";
  return (
    <Image
      unoptimized
      className={cx("nc-img nc-agent", className)}
      src={asset(dark ? "Agente-CCP/agent-symbol-dark.svg" : "Agente-CCP/agent-symbol-light.svg")}
      width={width}
      height={Math.round(width * (dark ? 385 / 544 : 361 / 520))}
      alt="Agente CCP"
      style={style}
    />
  );
}

const POSES: Record<string, [number, number]> = {
  "hat-eyes": [320, 320],
  sticker: [256, 320],
  newspaper: [383, 320],
  keyhole: [320, 320],
  "no-sign": [273, 320],
  sneaking: [370, 320],
  shirt: [180, 320],
  "latest-news": [169, 320],
  "trench-coat": [210, 320],
  "secret-detective": [569, 320],
};

export type AgentPose = "hat-eyes" | "sticker" | "newspaper" | "keyhole" | "no-sign" | "sneaking" | "shirt" | "latest-news" | "trench-coat" | "secret-detective";

export function AgentReference({ pose = "trench-coat", height = 320, stickerBorder, className, style }: GraphicBase & { pose?: AgentPose; height?: number; stickerBorder?: boolean }) {
  const d = POSES[pose] ?? [320, 320];
  return (
    <Image
      unoptimized
      className={cx("nc-img nc-agent", stickerBorder && "nc-agent--sticker", className)}
      src={asset(`Agente-CCP/agent-${pose}.svg`)}
      height={height}
      width={Math.round((height * d[0]) / d[1])}
      alt="Agente CCP"
      style={style}
    />
  );
}
