###### Current Feature
**Feature:** Events Page

###### Status
Completed — Events from the `Event` collection render on `/events` via a new `blocks.events-list` dynamic-zone block as cards showing image (gradient fallback), Upcoming/Past status badge, date, location, title and a description snippet; upcoming events sort soonest-first ahead of past events newest-first. Client-side filter: All / Upcoming / Past pills composed with a text search over title, location and description. Each card links to the detail page `/events/[slug]`, rewritten from the static build-time loader to SSR (`fetchStrapi` by slug) with Breadcrumb (Home › Events › Title), date, location, image and rich-text description; the unused `events` collection was removed from `content.config.ts`, fixing the "events collection empty" build warning. Seed creates 8 dummy events (4 upcoming, 4 past, cross-consistent with seeded press releases) with generated SVG cover images (idempotent per title; `makeCoverSvg` generalised to take a kicker label), grants Public find/findOne on Event, and wires the `/events` page (only when missing or placeholder-only; nav already links `/events`).

###### History
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
