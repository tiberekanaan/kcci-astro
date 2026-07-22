###### Current Feature
**Feature:** Press Release Page

###### Status
Completed — Press releases from the `Press Release` collection (extended with a required `category` enum `news` / `announcement` / `event`, default `news`, and a `coverImage` media field) render on `/press-releases` via a new `blocks.press-releases-list` dynamic-zone block as cards showing cover image (gradient fallback), category badge, date, title and excerpt. Each card links to an SSR detail page `/press-releases/[slug]` showing breadcrumb (Home › Press Releases › Title), category, date, cover image and rich-text content; a reusable `Breadcrumb.astro` component was added. The listing has a client-side filter: category pills (All / News / Announcements / Events) composed with a text search over title + excerpt. Seed creates 10 dummy press releases with generated SVG cover images (idempotent per title), grants Public find/findOne on Press Release, creates the `/press-releases` page (only when missing or placeholder-only) and appends a "Press Releases" nav link when absent.

###### History
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
