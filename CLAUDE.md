# Developer Knowledge Hub

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types for our Astro 6 + Strapi 5 project.

## Context Files

Read the following to get the full context of the project:

- @./context/project-overview.md
- @./context/coding-standards.md
- @./context/ai-interaction.md
- @./context/current-feature.md

## Commands

### Frontend (Astro 6)
```bash
npm run dev      # start Astro dev server locally
npm run build    # build the Astro project for production
npm run preview  # preview the production build locally
npx astro add    # add new Astro integrations (e.g., npx astro add react)
```

### Backend (Strapi 5)
```bash
npm run strapi develop  # start Strapi dev server with auto-reloading
npm run strapi build    # build the Strapi admin panel
npm run strapi start    # start the Strapi server in production mode
npm run strapi generate # interactively scaffold new APIs, controllers, and content-types
```

## Astro 6 Coding Standards & Rules
When generating or modifying frontend code, adhere to the following Astro 6 standards:
- **Routing & Transitions:** Use the `<ClientRouter />` component for view transitions; the old `<ViewTransitions />` component has been removed in v6.0.
- **Data Fetching:** Fetch CMS data using the Content Loader API (`src/content.config.ts`) instead of legacy collections.
- **Dynamic Content:** Use Server Islands with the `server:defer` directive for dynamic user-specific components.
- **File Imports:** Use Vite's `import.meta.glob()` or `getCollection()` to load files; `Astro.glob()` has been completely removed in Astro 6.
- **Schemas:** We are using Zod 4. Format validations like `z.string().email()` should now be written directly as `z.email()`.
- **Environment Variables:** Access environment variables inline using `import.meta.env` (e.g., `import.meta.env.SITE`) as it is strictly inlined in v6.

## Strapi 5 Coding Standards & Rules
When generating or modifying backend code, adhere to the following Strapi 5 standards:
- **Document Service API:** Always use the new Document Service API (`strapi.documents`) for CRUD operations instead of the deprecated Entity Service API.
- **Identifiers:** Query and reference entries using the 24-character alphanumeric `documentId` rather than the legacy numeric `id`.
- **Draft & Publish:** Utilize the Document API's new methods like `publish()`, `unpublish()`, and `discardDraft()` to manage content states programmatically.
- **Responses:** Expect flattened API responses by default (no need to heavily map through `.attributes` wrappers like in v4).

## Agent Interaction Rules
- **NO PLEASANTRIES**: Do not say "Sure, I can help with that," "Here is the code," or "Let me know if you need anything else."
- **NO CODE REPEATS**: When modifying existing code, only output the changed lines or functions. Do not rewrite unchanged context. Use placeholder comments like `// ... existing code ...` to indicate skipped sections.
- **CONCISE LOGIC**: Explain architectural decisions in bullet points of under 10 words.
- **DRY RUN FIRST**: If a task requires structural changes, outline the plan in 3 bullet points and wait for my confirmation before writing code.
- **ACKNOWLEDGE**: Acknowledge with "Ready." and nothing else.
```



## Git & Deployment Workflow
When asked to implement a new feature, fix a bug, or modify the codebase, strictly adhere to the following workflow:
1. **Branching:** Do not commit directly to the `main` branch. Always create and switch to a new feature branch first (e.g., `git checkout -b feature/name-of-feature`).
2. **Implementation:** Make the requested code changes on the feature branch.
3. **Local Testing:** Wait for the user to test and verify the changes locally using their independently running development servers. Do not attempt to run or restart servers yourself.
4. **Merge:** Once the user confirms the changes are working as expected, commit the changes, switch back to `main`, and merge the feature branch.
