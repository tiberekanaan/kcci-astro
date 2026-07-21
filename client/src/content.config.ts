import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { strapiLoader } from 'strapi-community-astro-loader';

// Strapi v5 content API root. The @strapi/client expects the URL to
// include the `/api` path segment.
const baseURL = `${import.meta.env.STRAPI_BASE_URL}/api`;

// Shared shape for Strapi media fields (e.g. event/member images).
const strapiImage = z.object({
  url: z.string(),
  alternativeText: z.string().nullish(),
});

const events = defineCollection({
  loader: strapiLoader({
    contentType: 'event',
    clientConfig: { baseURL },
    params: { populate: ['image'] },
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.string().nullish(),
    location: z.string().nullish(),
    description: z.string().nullish(),
    image: strapiImage.nullish(),
  }),
});

const faqs = defineCollection({
  loader: strapiLoader({
    contentType: 'faq',
    clientConfig: { baseURL },
  }),
  schema: z.object({
    question: z.string(),
    answer: z.string().nullish(),
    category: z.string().nullish(),
  }),
});

const executiveMembers = defineCollection({
  loader: strapiLoader({
    contentType: 'executive-member',
    clientConfig: { baseURL },
    params: { populate: ['image'] },
  }),
  schema: z.object({
    name: z.string(),
    role: z.string().nullish(),
    bio: z.string().nullish(),
    memberType: z.enum(['board', 'executive']).nullish(),
    order: z.number().nullish(),
    image: strapiImage.nullish(),
  }),
});

export const collections = { events, faqs, executiveMembers };
