import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HONEYPOT_FIELD, type SelectOption } from "@/lib/forms/validation";

const control =
  "block w-full rounded-none border border-line bg-white px-4 py-3.5 text-base text-charcoal placeholder:text-slate/60 transition-colors duration-200 hover:border-slate/50 focus:border-navy focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-gold aria-[invalid=true]:border-danger";

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, required, error, hint, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.8rem] font-semibold tracking-wide text-navy">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-gold-deep">
            *
          </span>
        ) : (
          <span className="ml-2 font-normal text-slate">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-slate">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type BaseProps = { name: string; label: string; error?: string; hint?: string; className?: string };

export function TextField({
  name,
  label,
  error,
  hint,
  className,
  required,
  ...props
}: BaseProps & Omit<ComponentProps<"input">, "name">) {
  const id = `field-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={control}
        {...props}
      />
    </FieldShell>
  );
}

export function TextareaField({
  name,
  label,
  error,
  hint,
  className,
  required,
  ...props
}: BaseProps & Omit<ComponentProps<"textarea">, "name">) {
  const id = `field-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        name={name}
        required={required}
        rows={6}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(control, "resize-y")}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  className,
  required,
  options,
  placeholder = "Please select",
  ...props
}: BaseProps & Omit<ComponentProps<"select">, "name"> & { options: SelectOption[]; placeholder?: string }) {
  const id = `field-${name}`;
  return (
    <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(control, "appearance-none pr-12")}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-navy"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  error,
  onChange,
}: {
  name: string;
  label: ReactNode;
  error?: string;
  onChange?: () => void;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          required
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-navy"
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-charcoal/85">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 pl-8 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Visually hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={`field-${HONEYPOT_FIELD}`}>Leave this field empty</label>
      <input id={`field-${HONEYPOT_FIELD}`} type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}
