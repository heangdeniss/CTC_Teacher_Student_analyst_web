/** @type {import('tailwindcss').Config} */
export default {
  // Scoped to the Student Analyst dashboard only — Teacher Analyst / Welcome
  // markup never uses Tailwind class names, so scanning them is unnecessary.
  content: ['./src/student/**/*.{js,jsx}'],
  // Every generated utility is prefixed with this selector so Tailwind can
  // never affect anything outside the Student Analyst subtree.
  important: '.student-analyst-root',
  corePlugins: {
    // Preflight resets global elements (h1, button, ...) which would bleed
    // into the Teacher Analyst app. A scoped equivalent lives in student.css.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        navy: '#172554',
        brand: { DEFAULT: '#2563EB', light: '#3B82F6', tint: '#DBEAFE' },
        teal: { DEFAULT: '#0F766E', tint: '#CCFBF1' },
        purple: { DEFAULT: '#7C3AED', tint: '#EDE9FE' },
        canvas: '#F5F7FB',
        line: '#E2E8F0',
        ink: '#172033',
        muted: '#64748B',
        positive: { DEFAULT: '#16A34A', tint: '#DCFCE7' },
        warning: { DEFAULT: '#D97706', tint: '#FEF3C7' },
        negative: { DEFAULT: '#DC2626', tint: '#FEE2E2' },
        info: '#0284C7',
      },
      fontFamily: {
        // Matches the rest of this app (see src/App.css) so the Student
        // Analyst dashboard doesn't read as a visually separate app, and so
        // Latin substrings inside Khmer strings (e.g. "CTC", "AI") render in
        // the same typeface as the surrounding Khmer glyphs instead of a
        // mismatched fallback font.
        sans: ['Kantumruy Pro', 'Battambang', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        khmer: ['Kantumruy Pro', 'Battambang', 'Noto Sans Khmer', 'Khmer OS', 'sans-serif'],
      },
      fontSize: {
        'dash-title': ['30px', { lineHeight: '36px', fontWeight: '600' }],
        // Matches the Teacher Analyst dashboards' page title exactly
        // (src/App.css .header h1: 2.5rem / weight 700) so both apps read
        // as one product.
        'page-title': ['2.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        'section-title': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'chart-title': ['15px', { lineHeight: '20px', fontWeight: '600' }],
        kpi: ['30px', { lineHeight: '36px', fontWeight: '600' }],
        'kpi-sm': ['26px', { lineHeight: '32px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px' }],
        small: ['13px', { lineHeight: '18px' }],
      },
      spacing: { 18: '4.5rem' },
      boxShadow: { card: '0 1px 2px 0 rgb(15 23 42 / 0.04)' },
    },
  },
  plugins: [],
};
