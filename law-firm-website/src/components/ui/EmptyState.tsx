import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="font-serif text-2xl text-navy">{title}</p>
      {children ? <div className="mx-auto mt-3 max-w-md text-sm text-slate">{children}</div> : null}
    </div>
  );
}
