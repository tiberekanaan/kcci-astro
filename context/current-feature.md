###### Current Feature
**Feature:** Fix External CTA Links (schemeless URLs)

###### Status
In progress — branch `fix/external-cta-link-normalization`. The homepage "Find an Advisor" button linked to `www.businesslinkpacific.com` entered in Strapi without `https://`, so the browser resolved it relative to the site (`kcci.org.ki/www.businesslinkpacific.com`). Fix is frontend-side so the mistake can't recur: new `client/src/lib/links.ts` exports `normalizeUrl()` (prepends `https://` to bare-hostname values; leaves paths/anchors/schemed URLs alone) and `buttonLinkAttrs()` (href + `target="_blank"`/`rel="noopener noreferrer"` when the link is external — detected by scheme or the Strapi `isExternal` flag). Applied via attribute spread in `Hero.astro`, `Cta.astro` (all three variants), and `ToolkitGrid.astro`. Optionally the Strapi entry can also be corrected to a full URL, but it renders correctly either way now.

###### In-progress Feature (parallel, branch `chore/remove-unused-content-collections`)
**Feature:** Remove Unused Build-Time Content Collections

###### Status
In progress — deletes the vestigial content layer. `src/content.config.ts` defined two collections (`faqs`, `executiveMembers`) via `strapi-community-astro-loader`, but nothing calls `getCollection()` anymore (all pages/components fetch live via `fetchStrapi()` in SSR). The loader still ran on every build and dev-server start, making Strapi Cloud a build-time dependency for no benefit and causing the "restart dev to pick up content" quirk. Change: delete `client/src/content.config.ts`, uninstall `strapi-community-astro-loader`, update the stale comment in `lib/strapi.ts`. After this, builds no longer contact Strapi at all; content is runtime-only. The Strapi `vercel-rebuild` webhook is left in place for now (redundant for SSR pages but harmless) — removing it is a separate decision.

###### Previous Feature
**Feature:** Custom Domain Setup (kcci.org.ki)
Production is live at `https://kcci.org.ki` (2026-07-23). DNS is hosted on **DigitalOcean** (registry delegation for `.ki` stays on `ns1–3.digitalocean.com`; we did NOT switch nameservers to Vercel). Both `kcci.org.ki` and `www.kcci.org.ki` have A records → `216.198.79.1` (Vercel's current anycast IP — valid even though the older CLI recommends `76.76.21.21`). Both domains are attached to the `kcci-astro` Vercel project with SSL certs issued; `www` 308-redirects to the apex (set via `PATCH /v9/projects/:id/domains/www.kcci.org.ki` with `{"redirect":"kcci.org.ki"}` — the CLI has no command for domain redirects). Gotcha that caused the original "invalid configuration" error: NS records pointing at `ns1/ns2.vercel-dns.com` had been added *inside* the DigitalOcean zone instead of at the registrar — this fails Vercel verification (it checks the registry delegation) and would intermittently break email by shadowing the zone's Zoho records; deleting those NS records fixed verification and cert issuance within minutes. Email (Zoho MX/SPF/DMARC on the same zone) is unaffected — any future DNS change must preserve those records. A stray `or.ki` domain (typo during setup) was removed from the Vercel account.

###### Older Feature
**Feature:** Strapi Cloud Go-Live (production deploy)
Completed — Strapi Cloud is live at `https://steadfast-amusement-5aeb4ddbe1.strapiapp.com` (content pushed via `strapi transfer` on 2026-07-22). Automatic builds are wired both ways: pushes to `main` on GitHub auto-deploy production (the Vercel project is git-connected to `tiberekanaan/kcci-astro`), and publishing content in Strapi Cloud fires a Strapi webhook (`vercel-rebuild`, events: entry publish/unpublish/delete + media create/update/delete) at the Vercel deploy hook `strapi-content-publish`, rebuilding production in ~30–60s. Both paths verified end-to-end. Local dev still snapshots content at server start — restart `npm run dev` to pick up new Strapi content. `STRAPI_BASE_URL` now points at it in `client/.env` (local dev; the old `http://127.0.0.1:1337` value is kept commented for switching back) and on the Vercel project for Production + Preview. Note: Vercel stores this project's env vars as type **sensitive** — `vercel env pull` and the API always return `""` for them, so an "empty-looking" pulled value does not mean the var is empty. Sensitive vars are only available to remote builds, so local `vercel build` can't see them (local builds read `client/.env` instead). The prebuilt deploy workaround (`vercel build --yes && vercel deploy --prebuilt`) is retired: plain `vercel deploy` (preview) and `vercel deploy --prod` both succeed with remote builds syncing content from Strapi Cloud. Production is live at `https://kcci-astro.vercel.app`. Preview URLs 302 to Vercel SSO first (Deployment Protection) — expected, not an app error.

###### Older Feature
**Feature:** Vercel Deployment Setup (Strapi Cloud–ready)
Completed — swaps the Astro adapter from `@astrojs/node` to `@astrojs/vercel@^10` (Astro 6–compatible) and links the repo to the `kcci-astro` Vercel project (rootDirectory `client`, deploys run from the repo root). `STRAPI_BASE_URL` fallbacks in `content.config.ts`/`lib/strapi.ts` now use `||` so an empty env var can't produce an invalid `/api` base URL. Until Strapi Cloud was live, remote Vercel builds failed at content sync, so deploys used the prebuilt flow against the local Strapi.

###### History
* Custom Domain Setup (kcci.org.ki) completed.
* Strapi Cloud Go-Live (production deploy) completed.
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
