###### Current Feature
**Feature:** Homepage CTA Layout Variants

###### Status
Completed — new `variant` enum (`split` | `spotlight` | `banner`, default `split`) on the `blocks.cta` component so the two homepage CTA sections stop rendering as identical mirrored split sections. `spotlight` renders the image with an overlapping white content card and gold accent bar (used by "Find a BLP Business Advisor"); `banner` renders a full-width photo with a green gradient overlay, centered headline and gold button as the page closer (used by "Ready to Join?", which now carries the `#join` anchor targeted by the header Join button). Existing/legacy CTA blocks keep the original `split` layout. One-time bootstrap backfill sets the two homepage CTAs' variants only while still `NULL`, so editor choices are never overwritten.

###### History
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
