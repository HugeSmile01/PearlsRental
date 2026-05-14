# UI conventions

## Design tokens
Primary UI tokens are defined in `src/app/globals.css` under `:root` and component layers.
Use semantic tokens and utility classes only (`.btn-*`, `.input`, `.section-title`, `.text-h*`).

## Buttons
- Variants: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`
- Sizes: default, `.btn-sm`, `.btn-lg`
- States: hover, active, focus-visible, disabled are built-in.
- Avoid inline padding/radius/typography overrides on buttons.

## Typography
- Heading scale: `.text-h1`, `.text-h2`, `.text-h3`
- Body copy: `.text-body` (or `text-sm` for dense metadata)
- Keep marketing copy concise and product-specific.

## Layout and spacing
- Use `.section` for page horizontal alignment.
- Prefer 4/6/8 spacing rhythm and avoid one-off arbitrary spacing unless required for responsiveness.

## Guardrails
Run `npm run lint` (TypeScript check) and `npm test` before merge. If adding new UI variants, extend shared classes in `globals.css` rather than component-local inline styles. Note: production builds currently skip ESLint (`next.config.js` sets `eslint.ignoreDuringBuilds`).
