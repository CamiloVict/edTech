/** Tema visual alineado con Edify (variables en globals.css: --primary, --accent). */
export const clerkFriendlyAppearance = {
  variables: {
    colorPrimary: '#0b1f3a',
    colorText: '#2b2b2b',
    colorTextSecondary: '#5f6b7a',
    colorBackground: '#ffffff',
    colorInputBackground: '#f7f9fc',
    colorInputText: '#2b2b2b',
    borderRadius: '0.75rem',
    fontSize: '1.0625rem',
  },
  elements: {
    card: 'shadow-none',
    headerTitle: 'text-xl font-bold text-[#2b2b2b]',
    headerSubtitle: 'text-[#5f6b7a]',
    socialButtonsBlockButton: 'border-[#e6e8ec] bg-white min-h-12',
    formButtonPrimary: 'min-h-12 font-semibold text-base',
    formFieldInput: 'min-h-12 text-base',
    footerActionLink: 'text-primary font-medium',
    identityPreviewText: 'text-[#2b2b2b]',
  },
} as const;
