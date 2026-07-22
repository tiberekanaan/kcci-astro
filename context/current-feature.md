###### Current Feature
**Feature:** Contact Page

###### Status
Completed — `/contact` renders a new `blocks.contact` dynamic-zone block (title, phone, email, address, officeHours, mapEmbedUrl) with contact detail cards, an embedded Google map of the KCCI office in Betio, and a contact form (name, email, subject, message + honeypot). The form submits through an Astro Action (`src/actions/index.ts`) that validates with Zod 4 and emails secretariat@kcci.org.ki via nodemailer over Zoho SMTP; credentials come from `astro:env` server secrets (SMTP_HOST/PORT/USER/PASS, CONTACT_EMAIL — placeholders commented in `client/.env`). Without SMTP configured, dev logs the email to the console and production returns a friendly error. Progressive enhancement: plain POST works without JS (result via `Astro.getActionResult`), an inline script upgrades to fetch with inline field errors and success/failure banners. Seed creates the `contact` page (rich-text intro + Contact block, only when missing or placeholder-only) and wires a "Contact" nav link (repointing any legacy `#contact` anchor).

###### History
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
