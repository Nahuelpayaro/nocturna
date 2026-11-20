"use client";

import { useEffect, useId, useRef, useState, type ComponentPropsWithRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/lib/ccp/assets";
import { Icon } from "./brand";

/* ---------- Input / Textarea ---------- */

export type InputProps = ComponentPropsWithRef<"input"> & { invalid?: boolean };

/** Input nativo con el estilo del DS. Controlado o no, como cualquier input. */
export function Input({ invalid, className, ...rest }: InputProps) {
  return <input {...rest} className={cx("nc-input", invalid && "is-error", className)} aria-invalid={invalid || rest["aria-invalid"] || undefined} />;
}

export type TextareaProps = ComponentPropsWithRef<"textarea"> & { invalid?: boolean };

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return <textarea {...rest} className={cx("nc-input nc-textarea", invalid && "is-error", className)} aria-invalid={invalid || rest["aria-invalid"] || undefined} />;
}

/* ---------- Select: combobox de solo selección (patrón WAI-ARIA APG), controlado ---------- */

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  /** Valor elegido; null o "" cuando no hay selección. */
  value: string | null;
  onChange: (value: string) => void;
  options: Array<SelectOption | string>;
  placeholder?: string;
  id?: string;
  /** Si se pasa, se agrega un input oculto con este name para formularios nativos. */
  name?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

const toOption = (o: SelectOption | string): SelectOption => (typeof o === "string" ? { value: o, label: o } : o);

export function Select({
  value,
  onChange,
  options,
  placeholder = "Elegí una opción",
  id,
  name,
  invalid,
  disabled,
  required,
  "aria-describedby": describedBy,
  "aria-labelledby": labelledBy,
  className,
}: SelectProps) {
  const autoId = useId();
  const comboId = id ?? `${autoId}-combo`;
  const listId = `${autoId}-list`;
  const opts = options.map(toOption);
  const selectedIndex = opts.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? opts[selectedIndex] : null;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", at: 0 });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const openMenu = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActive(index);
    setOpen(true);
  };
  const choose = (index: number) => {
    const o = opts[index];
    if (o) onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const last = opts.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.min(last, a + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.max(0, a - 1));
        return;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        return;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(last);
        }
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else openMenu();
        return;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        if (open) choose(active);
        return;
      default:
        if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
          const now = e.timeStamp;
          const t = typeahead.current;
          t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
          t.at = now;
          const i = opts.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
          if (i >= 0) {
            if (open) setActive(i);
            else openMenu(i);
          }
        }
    }
  };

  const state = open ? "is-focus" : invalid ? "is-error" : undefined;

  return (
    <div ref={wrapRef} className={cx("nc-select-wrap", className)}>
      <button
        type="button"
        id={comboId}
        role="combobox"
        className={cx("nc-input nc-select", state, selected && "has-value")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <Icon name="chevron-down" size={20} />
      </button>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <ul id={listId} role="listbox" className="nc-menu" hidden={!open} aria-labelledby={labelledBy}>
        {opts.map((o, i) => {
          const isSelected = o.value === value;
          return (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={isSelected}
              className={cx("nc-option", isSelected && "is-selected", open && i === active && "is-active")}
              onPointerEnter={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span>{o.label}</span>
              {isSelected ? <Icon name="check" size={20} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Checkbox (controlado, sin marcar por defecto) ---------- */

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  id?: string;
  name?: string;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

export function Checkbox({ checked, onChange, children, id, name, required, invalid, disabled, "aria-describedby": describedBy, className }: CheckboxProps) {
  return (
    <label className={cx("nc-check", checked && "is-checked", invalid && "is-error", className)}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        required={required}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="nc-check__box" aria-hidden="true">
        {checked ? <Icon name="check" size={16} /> : null}
      </span>
      <span className="nc-t-body-m">{children}</span>
    </label>
  );
}

/* ---------- RadioCard / RadioCardGroup (controlados) ---------- */

export type RadioCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export function RadioCard({ name, value, checked, onChange, title, description, disabled }: RadioCardProps) {
  return (
    <label className={cx("nc-radiocard", checked && "is-selected")}>
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} />
      <span className="nc-radiocard__title nc-t-body-l-strong">{title}</span>
      {description ? <span className="nc-radiocard__desc nc-t-body-m">{description}</span> : null}
    </label>
  );
}

export type RadioCardOption = { value: string; title: ReactNode; description?: ReactNode };

export type RadioCardGroupProps = {
  name: string;
  value: string | null;
  onChange: (value: string) => void;
  options: RadioCardOption[];
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  invalid?: boolean;
  className?: string;
};

/** Grupo de RadioCard. Usalo dentro de un Field con group (fieldset + legend) o pasale aria-labelledby. */
export function RadioCardGroup({ name, value, onChange, options, "aria-labelledby": labelledBy, "aria-describedby": describedBy, invalid, className }: RadioCardGroupProps) {
  return (
    <div className={cx("nc-radiogroup", className)} role="radiogroup" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid || undefined}>
      {options.map((o) => (
        <RadioCard key={o.value} name={name} value={o.value} title={o.title} description={o.description} checked={value === o.value} onChange={onChange} />
      ))}
    </div>
  );
}
