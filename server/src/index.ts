import type { Core } from '@strapi/strapi';

const MEMBER_UID = 'api::executive-member.executive-member';
const PAGE_UID = 'api::page.page';

// Dummy member profiles seeded once (only when the collection is empty) so
// the client has realistic content to edit/replace in the Strapi admin.
const DUMMY_MEMBERS = [
  {
    name: 'Taneti Baraniko',
    role: 'Board Chair',
    memberType: 'board',
    bio: 'Taneti has championed private-sector growth in Kiribati for over 15 years and runs a leading import and distribution business in Betio.',
  },
  {
    name: 'Ruta Tekanene',
    role: 'Deputy Chair',
    memberType: 'board',
    bio: 'Ruta owns one of South Tarawa’s largest retail groups and advocates for fair trading conditions for local wholesalers.',
  },
  {
    name: 'Ioteba Riwata',
    role: 'Director – Fisheries Sector',
    memberType: 'board',
    bio: 'Ioteba represents the fisheries and marine-exports sector, working closely with outer-island fishing cooperatives.',
  },
  {
    name: 'Maere Tabokai',
    role: 'Director – Tourism & Hospitality',
    memberType: 'board',
    bio: 'Maere operates eco-tourism ventures on Kiritimati and promotes sustainable tourism development across the islands.',
  },
  {
    name: 'Baraniko Etekiera',
    role: 'Director – Construction',
    memberType: 'board',
    bio: 'Baraniko leads a local construction firm and represents building and infrastructure businesses on the board.',
  },
  {
    name: 'Tessie Uriam',
    role: 'Director – Retail & SMEs',
    memberType: 'board',
    bio: 'Tessie is a small-business mentor who champions the interests of micro and small enterprises across Kiribati.',
  },
  {
    name: 'Teatao Kaitara',
    role: 'Director – Transport & Logistics',
    memberType: 'board',
    bio: 'Teatao manages inter-island shipping services and advises the Chamber on freight and logistics policy.',
  },
  {
    name: 'Moote Teannaki',
    role: 'Director – Agriculture & Copra',
    memberType: 'board',
    bio: 'Moote works with copra producers and agricultural exporters to strengthen outer-island livelihoods.',
  },
  {
    name: 'Kautu Bwebwentau',
    role: 'Director – Financial Services',
    memberType: 'board',
    bio: 'Kautu brings two decades of banking experience and guides the Chamber’s financial-inclusion initiatives.',
  },
  {
    name: 'Arawaia Ioane',
    role: 'Director – Women in Business',
    memberType: 'board',
    bio: 'Arawaia founded a women-led handicraft export collective and champions women’s entrepreneurship in Kiribati.',
  },
  {
    name: 'Tion Maamau',
    role: 'Chief Executive Officer',
    memberType: 'executive',
    bio: 'Tion leads the KCCI secretariat, driving the Chamber’s strategy, partnerships and member services.',
  },
  {
    name: 'Teraoi Tabwea',
    role: 'Membership & Advocacy Manager',
    memberType: 'executive',
    bio: 'Teraoi manages member relations and represents business concerns to government and development partners.',
  },
  {
    name: 'Akoia Tekinaiti',
    role: 'Finance & Administration Manager',
    memberType: 'executive',
    bio: 'Akoia oversees the Chamber’s finances, administration and reporting to the board.',
  },
  {
    name: 'Rooti Tioti',
    role: 'Events & Communications Officer',
    memberType: 'executive',
    bio: 'Rooti coordinates trade fairs, training workshops and the Chamber’s communications channels.',
  },
] as const;

// Pages that should carry a Members Grid block, keyed by slug.
const MEMBER_PAGES = [
  {
    slug: 'board-of-directors',
    intro:
      '# Board of Directors\n\nThe KCCI Board of Directors provides governance and strategic direction for the Chamber, representing the private sector across Kiribati.',
    gridTitle: 'Meet the Board',
    memberType: 'board',
  },
  {
    slug: 'executive-members',
    intro:
      '# Executive Members\n\nThe executive team manages the Chamber’s day-to-day operations and delivers services to our members.',
    gridTitle: 'Meet the Team',
    memberType: 'executive',
  },
] as const;

// Display order per seed member: position within its memberType group, in
// steps of 10 so the client can slot real members in between.
function seedOrderMap(): Map<string, number> {
  const counters: Record<string, number> = {};
  const map = new Map<string, number>();
  for (const member of DUMMY_MEMBERS) {
    const next = (counters[member.memberType] ?? 0) + 10;
    counters[member.memberType] = next;
    map.set(member.name, next);
  }
  return map;
}

async function seedDummyMembers(strapi: Core.Strapi) {
  const existing = await strapi.documents(MEMBER_UID).count({});
  if (existing > 0) return;

  const orders = seedOrderMap();
  for (const member of DUMMY_MEMBERS) {
    await strapi.documents(MEMBER_UID).create({
      data: { ...member, order: orders.get(member.name) ?? 0 },
      status: 'published',
    });
  }
  strapi.log.info(`[seed] Created ${DUMMY_MEMBERS.length} dummy members.`);
}

// One-off migration: members created before the `order` field existed get a
// sensible order (seed position for dummy entries, 0 otherwise).
async function backfillMemberOrder(strapi: Core.Strapi) {
  const members = await strapi.documents(MEMBER_UID).findMany({
    filters: { order: { $null: true } },
  });
  if (members.length === 0) return;

  const orders = seedOrderMap();
  for (const member of members) {
    await strapi.documents(MEMBER_UID).update({
      documentId: member.documentId,
      data: { order: orders.get(member.name ?? '') ?? 0 },
      status: 'published',
    });
  }
  strapi.log.info(`[seed] Backfilled order for ${members.length} members.`);
}

async function seedMemberGrids(strapi: Core.Strapi) {
  for (const def of MEMBER_PAGES) {
    const page = await strapi.documents(PAGE_UID).findFirst({
      filters: { slug: def.slug },
      populate: { content: { populate: '*' } },
    });
    if (!page) continue;

    const content = page.content ?? [];
    if (content.some((block) => block.__component === 'blocks.members-grid')) continue;

    // Only replace pages still holding the seeded placeholder text; never
    // overwrite content the client has already customised.
    const onlyPlaceholders = content.every(
      (block) =>
        block.__component === 'blocks.rich-text' &&
        (block.body ?? '').includes('Placeholder content'),
    );
    if (!onlyPlaceholders) {
      strapi.log.warn(
        `[seed] Page "${def.slug}" has custom content; add the Members Grid block manually.`,
      );
      continue;
    }

    await strapi.documents(PAGE_UID).update({
      documentId: page.documentId,
      data: {
        content: [
          { __component: 'blocks.rich-text', body: def.intro },
          { __component: 'blocks.members-grid', title: def.gridTitle, memberType: def.memberType },
        ],
      },
      status: 'published',
    });
    strapi.log.info(`[seed] Added Members Grid to "${def.slug}".`);
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedDummyMembers(strapi);
    await backfillMemberOrder(strapi);
    await seedMemberGrids(strapi);
  },
};
