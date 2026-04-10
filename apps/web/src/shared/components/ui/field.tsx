import type {
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export function Field({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
      {...props}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-[96px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
      {...props}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  return (
    <select
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
      {...props}
    />
  );
}
