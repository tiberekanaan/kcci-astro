### Coding Standards

#### TypeScript
*   **Strict mode enabled**.
*   **No `any` types** - use proper typing or `unknown`.
*   Define interfaces/types for all props and data models.
*   When typing Strapi 5 API responses, remember that **responses are flattened by default** (no `.attributes` wrappers) and entries are uniquely identified by a 24-character alphanumeric `documentId`.
*   Use type inference where obvious, explicit types where helpful.

#### Astro & UI Components
*   **Zero-JS by Default:** Use `.astro` functional components for UI layout and structure.
*   **Client Islands:** Only use UI framework components when client-side interactivity is strictly required, applying directives like `client:load` or `client:idle`.
*   **Server Islands:** Use the `server:defer` directive with a `<Fragment slot="fallback">` on Astro components for personalized or highly dynamic content to delay rendering without blocking the initial page load.
*   **Routing & Transitions:** Use the `<ClientRouter />` component for view transitions.
*   Keep components focused - one job per component.

#### Data Fetching & Content Management
*   **Build-Time Fetching:** Fetch static content from Strapi using Astro's **Content Loader API** inside `src/content.config.ts`.
*   **Dynamic/SSR Fetching:** Use `prerender = false` on dynamic pages and fetch data directly utilizing `documentId` and `locale` search parameters.
*   **Zod 4 Validation:** Validate all fetched CMS content and user inputs using Zod 4 [8, 11]. Import `z` from `astro/zod`. 
*   **No Legacy Globbing:** Use `import.meta.glob()` to load local files.

#### Astro Actions (Mutations & Forms)
*   Use **Astro Actions** for form submissions and client-to-server mutations instead of standard API endpoints.
*   Define all actions in `src/actions/index.ts`.
*   Automatically validate JSON and form data inputs using Zod schemas within the action's `input` property.
*   Call actions directly from HTML forms using the `action={actions.name}` attribute, or from client-side scripts using `actions.name()`.

#### Tailwind CSS v4
**CRITICAL:** We are using Tailwind CSS v4 via the `@tailwindcss/vite` plugin, which uses CSS-based configuration.
*   **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files.
*   All theme configuration must be done in CSS using the `@theme` directive in `src/styles/global.css`.
*   Use CSS custom properties for colors, spacing, etc., specifically using semantic **OKLCH color tokens**.
*   No JavaScript-based config allowed.

#### File Organization
*   **Pages:** `src/pages/[route]/index.astro` 
*   **Components:** `src/components/[feature]/ComponentName.astro` 
*   **Server Actions:** `src/actions/index.ts` 
*   **Content Configuration:** `src/content.config.ts` 
*   **Styles:** `src/styles/global.css`
*   **Types:** `src/types/[feature].ts` 
*   **Lib/Utils:** `src/lib/[utility].ts`

#### Naming & Styling
*   **Components:** PascalCase (e.g., `ItemCard.astro`).
*   **Files:** Match component name or kebab-case.
*   **Tailwind CSS** for all styling; no inline styles.
*   Ensure `<style>` and `<script>` tags in `.astro` files are placed carefully, as they are now rendered in the **exact order they are defined** in Astro 6.

#### Environment Variables & Security
*   Define and validate environment variables using the `astro:env` module to ensure type safety.
*   Access standard environment variables inline using `import.meta.env` as they are strictly inlined in v6.
*   Content Security Policy (CSP) must remain enabled (`security.csp: true`) to protect against XSS.

#### Error Handling
*   **Action Errors:** Throw backend errors using `ActionError` from `astro:actions` with standard HTTP status codes (e.g., `NOT_FOUND`, `UNAUTHORIZED`).
*   **Input Errors:** Validate form errors safely on the frontend using the `isInputError()` utility to display field-specific validation messages.
*   Always return a safe, type-checked result from Actions and display user-friendly error messages.