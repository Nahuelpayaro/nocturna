import type { ReactNode } from "react";
import { cx } from "@/lib/ccp/assets";
import { Icon } from "./brand";

/** id del texto de ayuda de un Field, para el aria-describedby del control. */
export const fieldHelperId = (controlId: string) => `${controlId}-helper`;
/** id de la etiqueta de un Field, para el aria-labelledby de Select o RadioCardGroup. */
export const fieldLabelId = (controlId: string) => `${controlId}-label`;

export type FieldProps = {
  label: ReactNode;
  /** id del control: la etiqueta apunta acá (htmlFor) y el texto de ayuda usa fieldHelperId(id). */
  id: string;
  helper?: ReactNode;
  /** Si hay error, reemplaza al helper y pinta el campo en rojo. */
  error?: ReactNode;
  /** Para grupos (RadioCardGroup): fieldset + legend en vez de label. */
  group?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({ label, id, helper, error, group, className, children }: FieldProps) {
  const text = error || helper;
  const cls = cx("nc-field", error ? "is-error" : undefined, className);
  const helperNode = text ? (
    <span id={fieldHelperId(id)} className="nc-field__helper nc-t-body-m">
      {error ? <Icon name="alert-circle" size={16} /> : null}
      <span>{text}</span>
    </span>
  ) : null;
  if (group) {
    return (
      <fieldset className={cls}>
        <legend id={fieldLabelId(id)} className="nc-field__label nc-t-body-m-strong">
          {label}
        </legend>
        {children}
        {helperNode}
      </fieldset>
    );
  }
  return (
    <div className={cls}>
      <label id={fieldLabelId(id)} htmlFor={id} className="nc-field__label nc-t-body-m-strong">
        {label}
      </label>
      {children}
      {helperNode}
    </div>
  );
}

export function FormStatus({ tone = "success", className, children }: { tone?: "success" | "error"; className?: string; children: ReactNode }) {
  const error = tone === "error";
  return (
    <div className={cx("nc-status", error ? "is-error" : "is-success", className)} role={error ? "alert" : "status"}>
      <Icon name={error ? "alert-circle" : "check"} size={20} />
      <span className="nc-t-body-m">{children}</span>
    </div>
  );
}
