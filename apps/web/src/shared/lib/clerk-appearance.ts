/** Tema visual alineado con Trofo School (legible y calmado para familias). */
export const clerkFriendlyAppearance = {
  variables: {
    colorPrimary: '#065f46',
    colorText: '#1c1917',
    colorTextSecondary: '#57534e',
    colorBackground: '#ffffff',
    colorInputBackground: '#fafaf9',
    colorInputText: '#1c1917',
    borderRadius: '0.75rem',
    fontSize: '1.0625rem',
  },
  elements: {
    card: 'shadow-none',
    headerTitle: 'text-xl font-bold text-stone-900',
    headerSubtitle: 'text-stone-600',
    socialButtonsBlockButton: 'border-stone-200 bg-white min-h-12',
    formButtonPrimary: 'min-h-12 font-semibold text-base',
    formFieldInput: 'min-h-12 text-base',
    footerActionLink: 'text-emerald-800 font-medium',
    identityPreviewText: 'text-stone-800',
  },
} as const;
