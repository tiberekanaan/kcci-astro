###### Current Feature
**Feature:** External Registration Link (Softr)

###### Status
Completed — member registration is handled by a separate Softr app at `https://kcci.softr.app/registration`, but the nav "Registration" link (Membership dropdown) pointed to the internal placeholder page `/registration`. Adds an idempotent Strapi seed (`seedRegistrationLink`) that repoints the nav link at the Softr URL, deletes the placeholder `registration` page, and repoints the homepage "Join Now" buttons (Hero + bottom CTA banner) from the placeholder `www.kcci.org.ki` URL to the Softr app with `isExternal` set. The Header now renders `target="_blank" rel="noopener noreferrer"` on any absolute (`http…`) nav URL, and the header "Join" button links to the Softr registration app instead of `#join`.

###### History
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
