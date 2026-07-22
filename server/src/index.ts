import type { Core } from '@strapi/strapi';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MEMBER_UID = 'api::executive-member.executive-member';
const PAGE_UID = 'api::page.page';
const RESOURCE_UID = 'api::resource.resource';
const GLOBAL_UID = 'api::global.global';

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

// Dummy resources seeded once (only when the collection is empty). Document
// entries get a real one-page PDF generated and uploaded so View/Download
// buttons work out of the box; Link entries point to external sites.
const DUMMY_RESOURCES = [
  {
    title: 'Kiribati Companies Act',
    type: 'Document',
    category: 'regulations',
    description: 'The Companies Act governing incorporation and operation of businesses in Kiribati.',
  },
  {
    title: 'Employment and Industrial Relations Code',
    type: 'Document',
    category: 'regulations',
    description: 'Employment law covering contracts, wages and workplace relations in Kiribati.',
  },
  {
    title: 'Business Licence Application Guide',
    type: 'Document',
    category: 'regulations',
    description: 'Step-by-step guide to applying for a business licence in Kiribati.',
  },
  {
    title: 'KCCI Membership Application Form',
    type: 'Document',
    category: 'internal',
    description: 'Application form for new ordinary and associate members of the Chamber.',
  },
  {
    title: 'KCCI Constitution & By-Laws',
    type: 'Document',
    category: 'internal',
    description: 'The governing constitution and by-laws of the Kiribati Chamber of Commerce & Industry.',
  },
  {
    title: 'KCCI Annual Report 2025',
    type: 'Document',
    category: 'internal',
    description: 'Highlights of the Chamber’s activities, finances and member services for 2025.',
  },
  {
    title: 'SME Start-Up Checklist',
    type: 'Document',
    category: 'internal',
    description: 'A practical checklist for starting a small business in Kiribati.',
  },
  {
    title: 'Business Plan Template',
    type: 'Document',
    category: 'internal',
    description: 'A fill-in business plan template for new and growing Kiribati enterprises.',
  },
  {
    title: 'Pacific Trade Invest – Export Resources',
    type: 'Link',
    category: 'external',
    externalLink: 'https://pacifictradeinvest.com',
    description: 'External tools and market insights for Pacific exporters.',
  },
  {
    title: 'Ministry of Commerce – Business Portal',
    type: 'Link',
    category: 'external',
    externalLink: 'https://www.commerce.gov.ki',
    description: 'Government portal for business registration, licensing and trade information.',
  },
  {
    title: 'World Bank – Kiribati Country Profile',
    type: 'Link',
    category: 'external',
    externalLink: 'https://www.worldbank.org/en/country/kiribati',
    description: 'Economic data, reports and development projects for Kiribati.',
  },
] as const;

// Build a minimal valid one-page PDF containing the resource title, so the
// seeded documents are genuinely viewable/downloadable.
function makeDummyPdf(title: string): Buffer {
  const escape = (text: string) => text.replace(/[\\()]/g, '\\$&');
  const content =
    `BT /F1 18 Tf 72 770 Td (${escape(title)}) Tj ET\n` +
    `BT /F1 11 Tf 72 740 Td (Dummy document seeded for demonstration. Replace it in the Strapi admin.) Tj ET`;
  const header = '%PDF-1.4\n';
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
      '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
  ];
  const offsets: number[] = [];
  let position = header.length;
  for (const object of objects) {
    offsets.push(position);
    position += object.length;
  }
  const xref =
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${position}\n%%EOF\n`;
  return Buffer.from(header + objects.join('') + xref + trailer, 'latin1');
}

async function seedDummyResources(strapi: Core.Strapi) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'kcci-seed-'));
  let created = 0;
  try {
    for (const resource of DUMMY_RESOURCES) {
      // Idempotent per title so dummy items slot in next to any real
      // resources the client has already added.
      const existing = await strapi.documents(RESOURCE_UID).findFirst({
        filters: { title: resource.title },
      });
      if (existing) continue;

      let fileId: number | undefined;

      if (resource.type === 'Document') {
        const pdf = makeDummyPdf(resource.title);
        const fileName = `${resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
        const filePath = join(tmpDir, fileName);
        await writeFile(filePath, pdf);

        const [uploaded] = await strapi
          .plugin('upload')
          .service('upload')
          .upload({
            data: { fileInfo: { name: resource.title, caption: null, alternativeText: null } },
            files: {
              filepath: filePath,
              originalFilename: fileName,
              mimetype: 'application/pdf',
              size: pdf.length,
            },
          });
        fileId = uploaded?.id;
      }

      await strapi.documents(RESOURCE_UID).create({
        data: {
          title: resource.title,
          type: resource.type,
          category: resource.category,
          description: resource.description,
          externalLink: 'externalLink' in resource ? resource.externalLink : null,
          ...(fileId ? { file: fileId } : {}),
        },
        status: 'published',
      });
      created += 1;
    }
    if (created > 0) strapi.log.info(`[seed] Created ${created} dummy resources.`);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// One-off migration: resources holding no category (pre-field entries) or a
// retired enum value (`toolkits`) get their seed category; otherwise null →
// `internal` (AGM minutes and other Chamber uploads) and `toolkits` →
// `external`.
async function backfillResourceCategory(strapi: Core.Strapi) {
  const resources = await strapi.documents(RESOURCE_UID).findMany({});
  const valid = ['regulations', 'internal', 'external'];
  const stale = resources.filter((r) => !valid.includes((r.category as string) ?? ''));
  if (stale.length === 0) return;

  const categories = new Map<string, (typeof DUMMY_RESOURCES)[number]['category']>(
    DUMMY_RESOURCES.map((r) => [r.title, r.category]),
  );
  for (const resource of stale) {
    const fallback = (resource.category as string) === 'toolkits' ? 'external' : 'internal';
    await strapi.documents(RESOURCE_UID).update({
      documentId: resource.documentId,
      data: { category: categories.get(resource.title ?? '') ?? fallback },
      status: 'published',
    });
  }
  strapi.log.info(`[seed] Backfilled category for ${stale.length} resources.`);
}

// Grant the Public role read access to resources so the frontend can list
// them anonymously, mirroring the manual grants on other content types.
async function seedPublicResourcePermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  const actions = ['api::resource.resource.find', 'api::resource.resource.findOne'];
  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });
    if (existing) continue;

    await strapi.db
      .query('plugin::users-permissions.permission')
      .create({ data: { action, role: publicRole.id } });
    strapi.log.info(`[seed] Granted public permission "${action}".`);
  }
}

// Pages that carry a Resources List block: the all-categories overview plus
// one page per category (linked from the Resources nav dropdown).
const RESOURCE_PAGES = [
  {
    slug: 'resources',
    title: 'Resources',
    category: null,
    intro:
      '# Resources\n\nDownload Chamber documents, forms and guides, or browse external resources for doing business in Kiribati.',
    listTitle: 'Documents & Downloads',
  },
  {
    slug: 'internal-resources',
    title: 'Internal Resources',
    category: 'internal',
    intro:
      '# Internal Resources\n\nChamber documents, AGM minutes, reports, forms and business toolkits produced by KCCI.',
    listTitle: null,
  },
  {
    slug: 'external-resources',
    title: 'External Resources',
    category: 'external',
    intro:
      '# External Resources\n\nTools, portals and market insights from government and partner organisations.',
    listTitle: null,
  },
  {
    slug: 'regulations-and-acts',
    title: 'Regulations & Acts',
    category: 'regulations',
    intro:
      '# Regulations & Acts\n\nLaws and regulations related to doing business in Kiribati, internal and external.',
    listTitle: null,
  },
] as const;

// Wire each resource page: create it if missing, and add its Resources List
// block unless the client has already customised the page content.
async function seedResourcePages(strapi: Core.Strapi) {
  for (const def of RESOURCE_PAGES) {
    const content = [
      { __component: 'blocks.rich-text' as const, body: def.intro },
      {
        __component: 'blocks.resources-list' as const,
        title: def.listTitle,
        category: def.category,
      },
    ];

    const page = await strapi.documents(PAGE_UID).findFirst({
      filters: { slug: def.slug },
      populate: { content: { populate: '*' } },
    });

    if (!page) {
      await strapi.documents(PAGE_UID).create({
        data: { title: def.title, slug: def.slug, content },
        status: 'published',
      });
      strapi.log.info(`[seed] Created the "${def.slug}" page with a Resources List block.`);
      continue;
    }

    const existingContent = page.content ?? [];
    if (existingContent.some((block) => block.__component === 'blocks.resources-list')) continue;

    const onlyPlaceholders = existingContent.every(
      (block) =>
        block.__component === 'blocks.rich-text' &&
        (block.body ?? '').includes('Placeholder content'),
    );
    if (!onlyPlaceholders) {
      strapi.log.warn(
        `[seed] Page "${def.slug}" has custom content; add the Resources List block manually.`,
      );
      continue;
    }

    await strapi.documents(PAGE_UID).update({
      documentId: page.documentId,
      data: { content },
      status: 'published',
    });
    strapi.log.info(`[seed] Added the Resources List block to "${def.slug}".`);
  }
}

// Turn the plain "Resources" nav link into a dropdown holding the three
// category pages. Skipped once it already has children (seeded or edited).
async function seedResourcesNav(strapi: Core.Strapi) {
  const global = await strapi.documents(GLOBAL_UID).findFirst({
    populate: { navLinks: { populate: '*' } },
  });
  if (!global) return;

  const navLinks = global.navLinks ?? [];
  const resourcesIndex = navLinks.findIndex((group) => group.label === 'Resources');
  if (resourcesIndex === -1) {
    strapi.log.warn('[seed] No "Resources" nav item found; add the dropdown links manually.');
    return;
  }
  if ((navLinks[resourcesIndex].links?.length ?? 0) > 0) return;

  // Components must be re-sent in full (without ids) when updating.
  const rebuilt = navLinks.map((group) => ({
    label: group.label,
    url: group.url,
    links: (group.links ?? []).map((link) => ({ label: link.label, url: link.url })),
  }));
  rebuilt[resourcesIndex] = {
    label: 'Resources',
    url: null,
    links: RESOURCE_PAGES.filter((def) => def.category !== null).map((def) => ({
      label: def.title,
      url: `/${def.slug}`,
    })),
  };

  await strapi.documents(GLOBAL_UID).update({
    documentId: global.documentId,
    data: { navLinks: rebuilt },
    status: 'published',
  });
  strapi.log.info('[seed] Converted the "Resources" nav link into a dropdown.');
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
    await seedDummyResources(strapi);
    await backfillResourceCategory(strapi);
    await seedResourcePages(strapi);
    await seedResourcesNav(strapi);
    await seedPublicResourcePermissions(strapi);
  },
};
