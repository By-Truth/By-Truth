"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { FormStatus } from "./useProtectedForm";

/** Error summary shown above the submit button; focused so screen readers announce it. */
export function FormError({ status, message }: { status: FormStatus; message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "error" && message) ref.current?.focus();
  }, [status, message]);

  return (
    <div aria-live="assertive" aria-atomic="true">
      {status === "error" && message ? (
        <div ref={ref} tabIndex={-1} role="alert" className="flex gap-3 border-l-2 border-danger bg-danger/5 px-5 py-4 text-sm text-danger outline-none">
          <Icon name="alert" size={20} className="shrink-0" />
          <p>{message}</p>
        </div>
      ) : null}
    </div>
  );
}

/** Confirmation panel that replaces the form after a successful submission. */
export function FormSuccess({ title, message, onReset, resetLabel }: { title: string; message: string; onReset: () => void; resetLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="border border-line bg-white p-8 outline-none sm:p-12">
      <span className="grid size-12 place-items-center border border-success/40 text-success">
        <Icon name="check" size={24} />
      </span>
      <h2 className="mt-6 font-serif text-3xl text-navy">{title}</h2>
      <p className="mt-4 leading-relaxed text-slate">{message}</p>
      <button type="button" onClick={onReset} className="link-underline mt-8 text-sm font-semibold text-navy">
        {resetLabel}
      </button>
    </div>
  );
}

export function PrivacyNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-4 border border-gold/40 bg-gold/[0.07] px-5 py-4 text-sm leading-relaxed text-charcoal/85">
      <Icon name="lock" size={20} className="mt-0.5 shrink-0 text-gold-deep" />
      <div>{children}</div>
    </div>
  );
}
