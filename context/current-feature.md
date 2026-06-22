###### Current Feature
**Feature:** Dynamic Homepage & Global Layout Wiring

###### Status
In Progress — branch feature/dynamic-homepage. Wiring up the Astro static components to Strapi Single Types.

###### Goals
* Create a `global` Single Type in Strapi for the editable Header and Footer navigation.
* Fetch the `homepage` Single Type using native fetch (SSR with `prerender = false`) and populate the dynamic zone.
* Create a `BlockRenderer.astro` component to dynamically map Strapi components (`blocks.hero`, `blocks.about`, etc.) to the UI.
* Fetch the `global` Single Type in `Layout.astro` to populate the global Header and Footer.

###### History
* Astro UI and Page Generation completed.
* Astro Strapi Content Layer Integration completed.
* Astro 6 Frontend Initialization completed.
* KCCI Content Framework Schemas completed.
* Strapi 5 Backend Initialization completed.
* Repo initialized and context files added.
