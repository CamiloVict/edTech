import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-hover disabled:opacity-50',
  secondary:
    'border border-border bg-card text-foreground shadow-sm hover:bg-muted disabled:opacity-50',
  ghost:
    'text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
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
