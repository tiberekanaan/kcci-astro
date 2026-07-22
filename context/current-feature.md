###### Current Feature
**Feature:** Resources Document List

###### Status
In progress — Resources from the `Resource` collection render via the `blocks.resources-list` dynamic-zone block: title, description, type badge, file ext/size, View/Download buttons (uploaded file or external link), and a client-side search filter. Required `category` enum (`regulations` / `internal` / `external`, default `internal`); the block's optional `category` field narrows a page to one category. Single-category pages paginate client-side (5/10/20 per page selector, numbered pager with Prev/Next, hidden when one page; search composes with pagination and resets to page 1). Seeded pages: `/resources` (all categories, grouped with headings) plus `/internal-resources`, `/external-resources`, `/regulations-and-acts` (single category, no group headings); the "Resources" nav item is a dropdown linking the three category pages. Seed generates and uploads real dummy PDFs (idempotent per title), migrates legacy/null categories (`toolkits` → `external`), grants Public read on Resource, and creates/wires pages only when missing or placeholder-only.

###### History
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
