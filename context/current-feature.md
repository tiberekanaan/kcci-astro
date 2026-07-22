###### Current Feature
**Feature:** Strapi Cloud Go-Live (production deploy)

###### Status
Completed — Strapi Cloud is live at `https://steadfast-amusement-5aeb4ddbe1.strapiapp.com` (content pushed via `strapi transfer` on 2026-07-22). Automatic builds are wired both ways: pushes to `main` on GitHub auto-deploy production (the Vercel project is git-connected to `tiberekanaan/kcci-astro`), and publishing content in Strapi Cloud fires a Strapi webhook (`vercel-rebuild`, events: entry publish/unpublish/delete + media create/update/delete) at the Vercel deploy hook `strapi-content-publish`, rebuilding production in ~30–60s. Both paths verified end-to-end. Local dev still snapshots content at server start — restart `npm run dev` to pick up new Strapi content. `STRAPI_BASE_URL` now points at it in `client/.env` (local dev; the old `http://127.0.0.1:1337` value is kept commented for switching back) and on the Vercel project for Production + Preview. Note: Vercel stores this project's env vars as type **sensitive** — `vercel env pull` and the API always return `""` for them, so an "empty-looking" pulled value does not mean the var is empty. Sensitive vars are only available to remote builds, so local `vercel build` can't see them (local builds read `client/.env` instead). The prebuilt deploy workaround (`vercel build --yes && vercel deploy --prebuilt`) is retired: plain `vercel deploy` (preview) and `vercel deploy --prod` both succeed with remote builds syncing content from Strapi Cloud. Production is live at `https://kcci-astro.vercel.app`. Preview URLs 302 to Vercel SSO first (Deployment Protection) — expected, not an app error.

###### Previous Feature
**Feature:** Vercel Deployment Setup (Strapi Cloud–ready)
Completed — swaps the Astro adapter from `@astrojs/node` to `@astrojs/vercel@^10` (Astro 6–compatible) and links the repo to the `kcci-astro` Vercel project (rootDirectory `client`, deploys run from the repo root). `STRAPI_BASE_URL` fallbacks in `content.config.ts`/`lib/strapi.ts` now use `||` so an empty env var can't produce an invalid `/api` base URL. Until Strapi Cloud was live, remote Vercel builds failed at content sync, so deploys used the prebuilt flow against the local Strapi.

###### Older Feature
**Feature:** External Registration Link (Softr)
Completed — member registration is handled by a separate Softr app at `https://kcci.softr.app/registration`, but the nav "Registration" link (Membership dropdown) pointed to the internal placeholder page `/registration`. Adds an idempotent Strapi seed (`seedRegistrationLink`) that repoints the nav link at the Softr URL, deletes the placeholder `registration` page, and repoints the homepage "Join Now" buttons (Hero + bottom CTA banner) from the placeholder `www.kcci.org.ki` URL to the Softr app with `isExternal` set. The Header now renders `target="_blank" rel="noopener noreferrer"` on any absolute (`http…`) nav URL, and the header "Join" button links to the Softr registration app instead of `#join`.

###### History
* Vercel Deployment Setup (Strapi Cloud–ready) completed.
* External Registration Link (Softr) completed.
* Mobile Navigation Menu completed.
* Footer BLP Logo & Attribution completed.
* Homepage CTA Layout Variants completed.
* Our Partners Page completed.
* Contact Page completed.
* Events Page completed.
* Press Release Page completed.
* Resources Document List completed.
* Member Manual Ordering completed.
* Member Profiles (Board & Executive) completed.
* Nav Dropdown Groups completed.
* Sub-pages Backend Schemas completed.
* Editable CTA Images & Layout completed.
* Editable Site Logo & Favicon completed.
* Dynamic Homepage & Global Layout Wiring completed.
* Astro UI and Page Generation completed.
* Astro Strapi Content Layer Integration completed.
* Astro 6 Frontend Initialization completed.
* KCCI Content Framework Schemas completed.
* Strapi 5 Backend Initialization completed.
* Repo initialized and context files added.
