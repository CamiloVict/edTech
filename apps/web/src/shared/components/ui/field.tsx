import type {
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export function Field({
  label,
  hint,
  children,
}: PropsWithChildren<{ label: string; hint?: ReactNode }>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-base font-semibold text-foreground">{label}</span>
      {hint ? (
        <span className="-mt-0.5 text-sm leading-relaxed text-muted-foreground">
          {hint}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-12 rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/25"
      {...props}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-[5.5rem] rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/25"
      {...props}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  return (
    <select
      className="min-h-12 rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
      {...props}
    />
  );
}
