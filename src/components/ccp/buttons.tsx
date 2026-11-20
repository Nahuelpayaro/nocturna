import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { cx } from "@/lib/ccp/assets";
import { Icon, type IconName } from "./brand";

export type ButtonProps = {
  variant?: "primary" | "accent" | "secondary";
  size?: "s" | "m";
  /** Ancho completo siempre. */
  block?: boolean;
  /** Ancho completo solo en Mobile (como el modo Mobile del Figma). */
  blockMobile?: boolean;
  /** Ícono a la derecha. null para sacarlo. Por defecto arrow-right. */
  icon?: IconName | null;
  /** Con href se renderiza como link (next/link para rutas internas). */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "m",
  block,
  blockMobile,
  icon = "arrow-right",
  href,
  type = "button",
  disabled,
  onClick,
  className,
  children = "Pedí tu diagnóstico",
}: ButtonProps) {
  const cls = cx("nc-btn", `nc-btn--${variant}`, `nc-btn--${size}`, block && "nc-btn--block", blockMobile && "nc-btn--block-mobile", className);
  const content = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={size === "s" ? 20 : 24} /> : null}
    </>
  );
  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls} onClick={onClick}>
          {content}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}

export function TextLink({ size = "l", icon = "arrow-right", href = "#", className, children }: { size?: "l" | "m"; icon?: IconName | null; href?: string; className?: string; children: ReactNode }) {
  const cls = cx("nc-link", `nc-link--${size}`, className);
  const content = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={size === "m" ? 16 : 20} /> : null}
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}

export type IconButtonProps = {
  variant?: "primary" | "secondary";
  icon?: IconName;
  label: string;
  expanded?: boolean;
  controls?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function IconButton({ variant = "primary", icon = "menu-2", label, expanded, controls, onClick, className }: IconButtonProps) {
  return (
    <button type="button" className={cx("nc-iconbtn", `nc-iconbtn--${variant}`, className)} aria-label={label} aria-expanded={expanded} aria-controls={controls} onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}

export function Tag({ tone = "accent", className, children }: { tone?: "accent" | "ink" | "outline"; className?: string; children: ReactNode }) {
  return <span className={cx("nc-tag", `nc-tag--${tone}`, className)}>{children}</span>;
}
