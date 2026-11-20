import type { ReactNode } from "react";
import { cx } from "@/lib/ccp/assets";
import { Headline, Mark, Scribble, Underline, type HeadlineLines, type HeadlineSize, type MarkType } from "./graphics";

/* ---------- Tarjetas ---------- */

export function StepCard({ number, title, text }: { number: string; title: ReactNode; text: ReactNode }) {
  return (
    <div className="nc-step">
      <span className="nc-t-step">{number}</span>
      <span className="nc-t-title">{title}</span>
      <span className="nc-t-body-m nc-muted">{text}</span>
    </div>
  );
}

export function FeatureItem({ showIcon = true, mark = "check", markVariant = 2, children }: { showIcon?: boolean; mark?: MarkType; markVariant?: number; children: ReactNode }) {
  return (
    <div className="nc-feature">
      {showIcon ? <Mark type={mark} variant={markVariant} size={24} /> : null}
      <span className="nc-t-body-l">{children}</span>
    </div>
  );
}

export function StatCard({ value, label, tone = "default", showUnderline = true }: { value: ReactNode; label: ReactNode; tone?: "default" | "accent"; showUnderline?: boolean }) {
  const accent = tone === "accent";
  return (
    <div className={cx("nc-stat", accent && "nc-stat--accent")}>
      <span className="nc-t-data-xl">{value}</span>
      {!accent && showUnderline ? <Underline variant={2} width={200} /> : null}
      <span className="nc-t-body-l">{label}</span>
    </div>
  );
}

export function ProblemCard({ title, text, scribble = "ball", showScribble = true }: { title: ReactNode; text: ReactNode; scribble?: "ball" | "cross-out" | "loops"; showScribble?: boolean }) {
  return (
    <div className="nc-problem">
      {showScribble ? <Scribble variant={scribble} width={96} /> : null}
      <span className="nc-t-title">{title}</span>
      <span className="nc-t-body-l nc-muted">{text}</span>
    </div>
  );
}

export function GuaranteeCard({ title, text, children }: { title: ReactNode; text: ReactNode; children?: ReactNode }) {
  return (
    <div className="nc-guarantee">
      <span className="nc-t-heading">{title}</span>
      <span className="nc-t-body-l nc-muted">{text}</span>
      {children}
    </div>
  );
}

export function FactItem({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="nc-fact">
      <span className="nc-t-overline nc-subtle">{label}</span>
      <span className="nc-t-body-l-strong">{value}</span>
    </div>
  );
}

export function NumberedItem({ number, size = "m", children }: { number: string; size?: "m" | "l"; children: ReactNode }) {
  const l = size === "l";
  return (
    <div className={cx("nc-num", l && "nc-num--l")}>
      <span className={l ? "nc-t-data-l" : "nc-t-data-m nc-subtle"}>{number}</span>
      <span className={l ? "nc-t-title" : "nc-t-body-l"}>{children}</span>
    </div>
  );
}

export type CalloutProps = { tone?: "subtle" | "accent" | "ink"; kicker?: ReactNode; title: ReactNode; body?: ReactNode; className?: string };

export function Callout({ tone = "subtle", kicker, title, body, className }: CalloutProps) {
  return (
    <div className={cx("nc-callout", `nc-callout--${tone}`, tone === "ink" && "nc-paper", className)} data-theme={tone === "ink" ? "ink" : undefined}>
      {kicker ? <span className="nc-t-overline nc-callout__muted">{kicker}</span> : null}
      <span className="nc-t-heading">{title}</span>
      {body ? <span className="nc-t-body-l nc-callout__muted">{body}</span> : null}
    </div>
  );
}

/* ---------- Bloques ---------- */

export type SectionHeaderProps = HeadlineLines & {
  layout?: "stacked" | "split" | "centered";
  kicker?: ReactNode;
  body?: ReactNode;
  size?: HeadlineSize;
  /** Nivel del titular (h1 en una página sin hero, h2 por defecto). */
  as?: "h1" | "h2" | "h3";
  /** Cortes del titular en Mobile. */
  mobile?: HeadlineLines;
  /** id y tabIndex del titular, para moverle el foco cuando aparece. */
  headingId?: string;
  headingTabIndex?: number;
  className?: string;
};

export function SectionHeader({ layout = "stacked", kicker, body, size = "display-xl", as = "h2", mobile, headingId, headingTabIndex, className, ...lines }: SectionHeaderProps) {
  return (
    <div className={cx("nc-sh", `nc-sh--${layout}`, className)}>
      <div className="nc-sh__head">
        {kicker ? <span className="nc-t-overline nc-muted">{kicker}</span> : null}
        <Headline size={size} as={as} mobile={mobile} id={headingId} tabIndex={headingTabIndex} {...lines} />
      </div>
      {body ? <p className="nc-sh__body nc-t-body-l nc-muted">{body}</p> : null}
    </div>
  );
}
