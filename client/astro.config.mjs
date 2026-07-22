// @ts-check
import { defineConfig, envField } from 'astro/config';

import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // On-demand rendering for pages opting in via `export const prerender = false`
  // (e.g. the Strapi-driven homepage). Static pages stay prerendered.
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      // Zoho Mail SMTP credentials for the contact form. All optional so dev
      // works without them (the contact action logs the email instead).
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 465 }),
      SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PASS: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_EMAIL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'secretariat@kcci.org.ki',
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
