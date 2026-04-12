import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-emerald-800 text-white shadow-sm hover:bg-emerald-900 disabled:opacity-50',
  secondary:
    'border border-stone-200 bg-white text-stone-900 shadow-sm hover:bg-stone-50 disabled:opacity-50',
  ghost:
    'text-stone-700 hover:bg-stone-100 disabled:opacity-50',
};

const baseButtonClass =
  'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition';

export function buttonStyles(
  variant: NonNullable<ButtonProps['variant']> = 'primary',
  className = '',
) {
  return `${baseButtonClass} ${variants[variant]} ${className}`.trim();
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonStyles(variant, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
