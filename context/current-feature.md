###### Current Feature
**Feature:** Member Profiles (Board & Executive)

###### Status
Completed — `board-of-directors` and `executive-members` pages feature member profiles (image, name, role, bio summary) managed in Strapi. Existing `executive-member` collection (renamed to display as "Member") gains a required `memberType` enum (`board` | `executive`); client adds/edits/deletes entries there. New `blocks.members-grid` dynamic-zone block (title + `memberType` filter) added to the `page` content zone; `MembersGrid.astro` fetches filtered members SSR and renders the profile grid (default avatar SVG when no image). Idempotent bootstrap seed (`server/src/index.ts`): 14 dummy members (10 board, 4 executive) created when the collection is empty; Members Grid + intro blocks seeded onto both pages when they still hold placeholder content. Verified via API — both pages now serve the grid blocks. Fix: scroll-reveal script moved from `index.astro` to `Layout.astro` — `[data-reveal]` elements were stuck at `opacity: 0` on non-homepage pages.

###### History
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
