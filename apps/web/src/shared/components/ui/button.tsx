import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50',
  secondary:
    'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50',
  ghost: 'text-zinc-700 hover:bg-zinc-100 disabled:opacity-50',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
