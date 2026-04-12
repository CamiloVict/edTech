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
      <span className="text-base font-semibold text-stone-900">{label}</span>
      {hint ? (
        <span className="-mt-0.5 text-sm leading-relaxed text-stone-500">
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
      className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      {...props}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-[5.5rem] rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      {...props}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  return (
    <select
      className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      {...props}
    />
  );
}
