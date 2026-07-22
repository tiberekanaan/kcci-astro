import type { Core } from '@strapi/strapi';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MEMBER_UID = 'api::executive-member.executive-member';
const PAGE_UID = 'api::page.page';
const RESOURCE_UID = 'api::resource.resource';
const PRESS_UID = 'api::press-release.press-release';
const EVENT_UID = 'api::event.event';
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

// Dummy press releases seeded idempotently per title. Each gets a generated
// SVG cover image uploaded to the media library so the cards render with real
// images out of the box.
const DUMMY_PRESS_RELEASES = [
  {
    title: 'KCCI Launches 2026 Small Business Grant Programme',
    slug: 'kcci-launches-2026-small-business-grant-programme',
    date: '2026-07-02T09:00:00.000Z',
    category: 'announcement',
    excerpt:
      'Grants of up to AUD 5,000 are now open to member businesses looking to expand operations, upgrade equipment or enter new markets.',
    content:
      'The Kiribati Chamber of Commerce & Industry today opened applications for its 2026 Small Business Grant Programme, offering grants of up to AUD 5,000 for member businesses across Kiribati.\n\nThe programme prioritises outer-island enterprises, women-led businesses and ventures in fisheries, agriculture and tourism. Funds may be used for equipment, training, certification or market development.\n\n## How to apply\n\nApplications close on 31 August 2026. Members can collect an application form from the KCCI office in Betio or request one by email. A short business plan and a quotation for the proposed expenditure are required.',
  },
  {
    title: 'Chamber Signs MOU with Fiji Commerce & Employers Federation',
    slug: 'chamber-signs-mou-with-fiji-commerce-employers-federation',
    date: '2026-06-18T09:00:00.000Z',
    category: 'news',
    excerpt:
      'The partnership opens trade-mission exchanges, shared training programmes and market-access support for members in both countries.',
    content:
      'KCCI has signed a Memorandum of Understanding with the Fiji Commerce & Employers Federation (FCEF), formalising a partnership between the two national business organisations.\n\nUnder the MOU, the chambers will run reciprocal trade missions, share training resources and support members seeking to enter each other’s markets. The first joint activity — a Suva trade mission for Kiribati exporters — is planned for late 2026.\n\n“Regional partnerships like this one give our members practical pathways to new customers,” said the KCCI Chief Executive Officer at the signing ceremony.',
  },
  {
    title: 'Kiribati Trade Expo 2026 Dates Announced',
    slug: 'kiribati-trade-expo-2026-dates-announced',
    date: '2026-06-05T09:00:00.000Z',
    category: 'event',
    excerpt:
      'The national trade expo returns to Bairiki Square on 12–14 November 2026, with exhibitor registrations opening in July.',
    content:
      'The Kiribati Trade Expo will return to Bairiki Square from 12 to 14 November 2026, KCCI announced today.\n\nNow in its fourth edition, the expo showcases local producers, handicraft exporters, fisheries businesses and service providers to buyers, development partners and the public. Last year’s event attracted more than 80 exhibitors and 4,000 visitors.\n\nExhibitor registrations open in July. KCCI members receive discounted booth rates, and a limited number of subsidised booths are reserved for outer-island producers.',
  },
  {
    title: 'KCCI Welcomes New Board of Directors',
    slug: 'kcci-welcomes-new-board-of-directors',
    date: '2026-05-21T09:00:00.000Z',
    category: 'announcement',
    excerpt:
      'Members elected the 2026–2028 Board at the Annual General Meeting, returning Taneti Baraniko as Board Chair.',
    content:
      'The Chamber’s membership has elected a new Board of Directors for the 2026–2028 term at the Annual General Meeting held in Betio.\n\nTaneti Baraniko was returned as Board Chair, with Ruta Tekanene elected Deputy Chair. The ten-member board brings together representatives from fisheries, tourism, construction, retail, transport, agriculture and financial services.\n\nThe new board’s priorities include the national trade policy consultation, expansion of member training services and stronger outer-island representation.',
  },
  {
    title: 'Private Sector Consultation on National Trade Policy',
    slug: 'private-sector-consultation-on-national-trade-policy',
    date: '2026-04-30T09:00:00.000Z',
    category: 'news',
    excerpt:
      'KCCI submitted a consolidated private-sector position paper to the Ministry of Commerce as part of the national trade policy review.',
    content:
      'KCCI has submitted a consolidated private-sector position paper to the Ministry of Commerce, Industry and Cooperatives as part of the review of the national trade policy framework.\n\nThe paper draws on consultations with more than 60 member businesses across South Tarawa and the outer islands. Key recommendations cover streamlined import licensing, improved inter-island shipping schedules and targeted support for export-ready producers.\n\nThe Chamber thanked members for their contributions and will publish the full paper in the resources section once the ministry’s review concludes.',
  },
  {
    title: 'Women in Business Mentorship Programme Graduates First Cohort',
    slug: 'women-in-business-mentorship-programme-graduates-first-cohort',
    date: '2026-04-09T09:00:00.000Z',
    category: 'news',
    excerpt:
      'Eighteen women entrepreneurs completed the six-month mentorship programme, with a second cohort opening later this year.',
    content:
      'Eighteen women entrepreneurs graduated from the Chamber’s inaugural Women in Business Mentorship Programme at a ceremony in Betio this week.\n\nOver six months, participants were paired with experienced business mentors and completed workshops on financial management, pricing, digital marketing and accessing finance. Graduates run businesses ranging from handicraft exports to catering, retail and tourism services.\n\nApplications for the second cohort will open later in 2026. The programme is delivered with the support of development partners and the Director for Women in Business, Arawaia Ioane.',
  },
  {
    title: 'KCCI Annual General Meeting 2026 — Notice to Members',
    slug: 'kcci-annual-general-meeting-2026-notice-to-members',
    date: '2026-03-19T09:00:00.000Z',
    category: 'announcement',
    excerpt:
      'The 2026 AGM will be held on 15 May at the Otintaai Hotel, Bikenibeu. Financial members are entitled to vote on board elections.',
    content:
      'Notice is hereby given that the Annual General Meeting of the Kiribati Chamber of Commerce & Industry will be held on Friday 15 May 2026 at the Otintaai Hotel, Bikenibeu, commencing at 2:00 pm.\n\nThe agenda includes the annual report, audited financial statements, election of the 2026–2028 Board of Directors and proposed amendments to the membership by-laws.\n\nOnly financial members are entitled to vote. Members wishing to stand for the board must lodge nominations with the secretariat by 1 May 2026.',
  },
  {
    title: 'Digital Skills Training Workshop for SMEs',
    slug: 'digital-skills-training-workshop-for-smes',
    date: '2026-02-26T09:00:00.000Z',
    category: 'event',
    excerpt:
      'A free two-day workshop covering online payments, social-media marketing and basic bookkeeping software runs 24–25 March.',
    content:
      'KCCI will host a free two-day Digital Skills Training Workshop for small and medium enterprises on 24–25 March 2026 at the Chamber office in Betio.\n\nSessions cover setting up online payments, marketing a business on social media, and using free bookkeeping software. Participants should bring a smartphone or laptop; a limited number of devices will be available on the day.\n\nPlaces are limited to 30 participants and members receive priority. Register with the secretariat by 18 March.',
  },
  {
    title: 'Chamber Responds to New Import Levy Proposal',
    slug: 'chamber-responds-to-new-import-levy-proposal',
    date: '2026-02-05T09:00:00.000Z',
    category: 'news',
    excerpt:
      'KCCI has asked government to phase in the proposed levy over two years and exempt essential business inputs.',
    content:
      'Responding to the proposed import levy announced in the national budget, KCCI has urged government to phase in the measure over two years and to exempt essential business inputs such as fuel, building materials and fishing equipment.\n\nIn its submission, the Chamber acknowledged the revenue objectives of the levy but warned that an immediate, across-the-board introduction would raise costs sharply for retailers and outer-island consumers.\n\nKCCI has requested a joint working group with the Ministry of Finance and Economic Development to review the levy schedule before it takes effect.',
  },
  {
    title: 'KCCI and MFED Host Business Licensing Forum',
    slug: 'kcci-and-mfed-host-business-licensing-forum',
    date: '2026-01-15T09:00:00.000Z',
    category: 'event',
    excerpt:
      'Over 50 business owners joined the forum on licensing reform, with government committing to a simplified renewal process.',
    content:
      'More than 50 business owners attended a joint KCCI–Ministry of Finance and Economic Development forum on business licensing reform held at the Parliament conference room in Ambo.\n\nParticipants raised concerns about renewal delays, inconsistent fees between councils and the lack of an online application option. Officials committed to piloting a simplified renewal process in South Tarawa during 2026.\n\nThe Chamber will circulate the forum outcomes to members and monitor progress on the commitments made.',
  },
] as const;

// Palette pairs (dark gradient stops) rotated across the generated covers.
const COVER_PALETTES = [
  ['#1b7a43', '#0e4d2a'],
  ['#b98a2f', '#7a5a1d'],
  ['#20707a', '#123f45'],
  ['#4a5d8a', '#2b3a5e'],
] as const;

// Build a simple branded SVG cover (gradient, KCCI wordmark, kicker label,
// wrapped title) so seeded entries ship with a real cover image.
function makeCoverSvg(title: string, kicker: string, index: number): Buffer {
  const escapeXml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines: string[] = [];
  let line = '';
  for (const word of title.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 26 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, 3);
  if (lines.length > 3) shown[2] += '…';

  const [from, to] = COVER_PALETTES[index % COVER_PALETTES.length];
  const titleText = shown
    .map(
      (text, i) =>
        `<text x="80" y="${430 + i * 74}" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#ffffff">${escapeXml(text)}</text>`,
    )
    .join('\n  ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#bg)"/>
  <circle cx="1050" cy="110" r="230" fill="#ffffff" opacity="0.08"/>
  <circle cx="140" cy="690" r="260" fill="#ffffff" opacity="0.06"/>
  <text x="80" y="140" font-family="Verdana, sans-serif" font-size="30" font-weight="bold" letter-spacing="6" fill="#ffffff" opacity="0.9">KCCI</text>
  <text x="80" y="330" font-family="Verdana, sans-serif" font-size="24" letter-spacing="4" fill="#ffffff" opacity="0.75">${escapeXml(kicker.toUpperCase())}</text>
  ${titleText}
</svg>
`;
  return Buffer.from(svg, 'utf8');
}

async function seedDummyPressReleases(strapi: Core.Strapi) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'kcci-seed-press-'));
  let created = 0;
  try {
    for (const [index, release] of DUMMY_PRESS_RELEASES.entries()) {
      // Idempotent per title so dummy items slot in next to any real press
      // releases the client has already added.
      const existing = await strapi.documents(PRESS_UID).findFirst({
        filters: { title: release.title },
      });
      if (existing) continue;

      const svg = makeCoverSvg(release.title, `Press Release · ${release.category}`, index);
      const fileName = `${release.slug}.svg`;
      const filePath = join(tmpDir, fileName);
      await writeFile(filePath, svg);

      const [uploaded] = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: { fileInfo: { name: release.title, caption: null, alternativeText: release.title } },
          files: {
            filepath: filePath,
            originalFilename: fileName,
            mimetype: 'image/svg+xml',
            size: svg.length,
          },
        });

      await strapi.documents(PRESS_UID).create({
        data: {
          title: release.title,
          slug: release.slug,
          date: release.date,
          excerpt: release.excerpt,
          content: release.content,
          category: release.category,
          ...(uploaded?.id ? { coverImage: uploaded.id } : {}),
        },
        status: 'published',
      });
      created += 1;
    }
    if (created > 0) strapi.log.info(`[seed] Created ${created} dummy press releases.`);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// Grant the Public role read access to press releases so the frontend can
// list and open them anonymously.
async function seedPublicPressReleasePermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  const actions = [
    'api::press-release.press-release.find',
    'api::press-release.press-release.findOne',
  ];
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

// Wire the /press-releases page: create it if missing, and add its Press
// Releases List block unless the client has already customised the content.
async function seedPressReleasePage(strapi: Core.Strapi) {
  const content = [
    {
      __component: 'blocks.rich-text' as const,
      body: '# Press Releases\n\nNews, announcements and events from the Kiribati Chamber of Commerce & Industry.',
    },
    { __component: 'blocks.press-releases-list' as const, title: null },
  ];

  const isPlaceholderOnly = (blocks: { __component: string; body?: string | null }[]) =>
    blocks.every(
      (block) =>
        block.__component === 'blocks.rich-text' &&
        (block.body ?? '').includes('Placeholder content'),
    );

  const page = await strapi.documents(PAGE_UID).findFirst({
    filters: { slug: 'press-releases' },
    populate: { content: { populate: '*' } },
  });

  // The sub-pages seed originally shipped a singular "press-release"
  // placeholder page; migrate it to the plural slug used by the listing and
  // detail routes (or retire it once the plural page exists).
  const legacy = await strapi.documents(PAGE_UID).findFirst({
    filters: { slug: 'press-release' },
    populate: { content: { populate: '*' } },
  });
  const legacyPlaceholder = legacy && isPlaceholderOnly(legacy.content ?? []);

  if (!page && legacyPlaceholder) {
    await strapi.documents(PAGE_UID).update({
      documentId: legacy.documentId,
      data: { title: 'Press Releases', slug: 'press-releases', content },
      status: 'published',
    });
    strapi.log.info('[seed] Migrated the "press-release" placeholder page to "press-releases".');
    return;
  }

  if (page && legacyPlaceholder) {
    await strapi.documents(PAGE_UID).delete({ documentId: legacy.documentId });
    strapi.log.info('[seed] Removed the redundant "press-release" placeholder page.');
  } else if (legacy && !legacyPlaceholder) {
    strapi.log.warn('[seed] Page "press-release" has custom content; review it manually.');
  }

  if (!page) {
    await strapi.documents(PAGE_UID).create({
      data: { title: 'Press Releases', slug: 'press-releases', content },
      status: 'published',
    });
    strapi.log.info('[seed] Created the "press-releases" page with a Press Releases List block.');
    return;
  }

  const existingContent = page.content ?? [];
  if (existingContent.some((block) => block.__component === 'blocks.press-releases-list')) return;

  if (!isPlaceholderOnly(existingContent)) {
    strapi.log.warn(
      '[seed] Page "press-releases" has custom content; add the Press Releases List block manually.',
    );
    return;
  }

  await strapi.documents(PAGE_UID).update({
    documentId: page.documentId,
    data: { content },
    status: 'published',
  });
  strapi.log.info('[seed] Added the Press Releases List block to "press-releases".');
}

// Point the nav at the /press-releases page: repoint a legacy "Press
// Release" link (and drop duplicates), or append a flat link when absent.
async function seedPressReleaseNav(strapi: Core.Strapi) {
  const global = await strapi.documents(GLOBAL_UID).findFirst({
    populate: { navLinks: { populate: '*' } },
  });
  if (!global) return;

  const navLinks = global.navLinks ?? [];
  const isPressLink = (group: (typeof navLinks)[number]) =>
    group.url === '/press-release' ||
    group.url === '/press-releases' ||
    /^press releases?$/i.test(group.label ?? '');
  const firstIndex = navLinks.findIndex(isPressLink);
  const desired = { label: 'Press Releases', url: '/press-releases', links: [] };

  const upToDate =
    firstIndex !== -1 &&
    navLinks.filter(isPressLink).length === 1 &&
    navLinks[firstIndex].label === desired.label &&
    navLinks[firstIndex].url === desired.url;
  if (upToDate) return;

  // Components must be re-sent in full (without ids) when updating.
  const kept = navLinks.filter((group, i) => !isPressLink(group) || i === firstIndex);
  const rebuilt = kept.map((group) => ({
    label: group.label,
    url: group.url,
    links: (group.links ?? []).map((link) => ({ label: link.label, url: link.url })),
  }));
  const pressIndex = kept.findIndex(isPressLink);
  if (pressIndex === -1) rebuilt.push(desired);
  else rebuilt[pressIndex] = desired;

  await strapi.documents(GLOBAL_UID).update({
    documentId: global.documentId,
    data: { navLinks: rebuilt },
    status: 'published',
  });
  strapi.log.info('[seed] Wired the "Press Releases" nav link.');
}

// Dummy events seeded idempotently per title: four upcoming and four past
// (relative to mid-2026), cross-consistent with the seeded press releases.
const DUMMY_EVENTS = [
  {
    title: 'Kiribati Trade Expo 2026',
    slug: 'kiribati-trade-expo-2026',
    date: '2026-11-12T09:00:00.000Z',
    location: 'Bairiki Square, Tarawa',
    description:
      'The national trade expo returns for its fourth edition, showcasing local producers, handicraft exporters, fisheries businesses and service providers to buyers, development partners and the public.\n\n## Programme highlights\n\n- Exhibitor booths from across Kiribati, including subsidised outer-island stalls\n- Buyer–seller matching sessions\n- Daily cultural performances and product demonstrations\n\nExhibitor registrations open in July; KCCI members receive discounted booth rates.',
  },
  {
    title: 'Suva Trade Mission for Kiribati Exporters',
    slug: 'suva-trade-mission-for-kiribati-exporters',
    date: '2026-10-05T09:00:00.000Z',
    location: 'Suva, Fiji',
    description:
      'A week-long trade mission to Suva organised under the KCCI–FCEF Memorandum of Understanding, connecting Kiribati exporters with Fijian buyers, distributors and logistics providers.\n\nThe delegation programme includes market visits, matched business meetings and a joint networking reception hosted by the Fiji Commerce & Employers Federation. Export-ready members in handicrafts, fisheries and agri-products are encouraged to apply.',
  },
  {
    title: 'Business After Hours Networking Evening',
    slug: 'business-after-hours-networking-evening',
    date: '2026-09-11T17:30:00.000Z',
    location: 'Otintaai Hotel, Bikenibeu',
    description:
      'An informal evening for members and guests to connect over refreshments, hear a short briefing on Chamber activities and meet the new Board of Directors.\n\nFree for members; a small door charge applies for non-members. Registration is appreciated for catering purposes.',
  },
  {
    title: 'SME Finance Clinic',
    slug: 'sme-finance-clinic',
    date: '2026-08-19T09:00:00.000Z',
    location: 'KCCI Office, Betio',
    description:
      'One-on-one advisory sessions with bank lending officers and Chamber advisers on loan applications, grant readiness and financial record-keeping for small businesses.\n\nBring your business records and any draft applications. Sessions run for 45 minutes and must be booked with the secretariat in advance; 2026 Small Business Grant applicants receive priority.',
  },
  {
    title: 'KCCI Annual General Meeting 2026',
    slug: 'kcci-annual-general-meeting-2026',
    date: '2026-05-15T14:00:00.000Z',
    location: 'Otintaai Hotel, Bikenibeu',
    description:
      'The Annual General Meeting of the Kiribati Chamber of Commerce & Industry, covering the annual report, audited financial statements, election of the 2026–2028 Board of Directors and proposed amendments to the membership by-laws.\n\nThe membership elected a new board at this meeting, returning Taneti Baraniko as Board Chair.',
  },
  {
    title: 'Digital Skills Training Workshop for SMEs',
    slug: 'digital-skills-training-workshop-for-smes',
    date: '2026-03-24T09:00:00.000Z',
    location: 'KCCI Office, Betio',
    description:
      'A free two-day workshop for small and medium enterprises covering online payments, social-media marketing and free bookkeeping software.\n\nThirty participants completed the programme, with priority given to members. A follow-up cohort is being considered for later in 2026.',
  },
  {
    title: 'Business Licensing Forum',
    slug: 'business-licensing-forum',
    date: '2026-01-14T09:00:00.000Z',
    location: 'Parliament Conference Room, Ambo',
    description:
      'A joint KCCI–Ministry of Finance and Economic Development forum on business licensing reform, attended by more than 50 business owners.\n\nParticipants raised renewal delays, inconsistent council fees and the lack of an online application option; officials committed to piloting a simplified renewal process in South Tarawa during 2026.',
  },
  {
    title: 'Kiribati Trade Expo 2025',
    slug: 'kiribati-trade-expo-2025',
    date: '2025-11-13T09:00:00.000Z',
    location: 'Bairiki Square, Tarawa',
    description:
      'The third edition of the national trade expo attracted more than 80 exhibitors and 4,000 visitors over three days.\n\nHighlights included the first dedicated outer-island producers pavilion and a buyer programme that generated new supply agreements for local handicraft and fisheries businesses.',
  },
] as const;

async function seedDummyEvents(strapi: Core.Strapi) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'kcci-seed-events-'));
  let created = 0;
  try {
    for (const [index, event] of DUMMY_EVENTS.entries()) {
      // Idempotent per title so dummy items slot in next to any real events
      // the client has already added.
      const existing = await strapi.documents(EVENT_UID).findFirst({
        filters: { title: event.title },
      });
      if (existing) continue;

      const svg = makeCoverSvg(event.title, 'KCCI Event', index);
      const fileName = `${event.slug}.svg`;
      const filePath = join(tmpDir, fileName);
      await writeFile(filePath, svg);

      const [uploaded] = await strapi
        .plugin('upload')
        .service('upload')
        .upload({
          data: { fileInfo: { name: event.title, caption: null, alternativeText: event.title } },
          files: {
            filepath: filePath,
            originalFilename: fileName,
            mimetype: 'image/svg+xml',
            size: svg.length,
          },
        });

      await strapi.documents(EVENT_UID).create({
        data: {
          title: event.title,
          slug: event.slug,
          date: event.date,
          location: event.location,
          description: event.description,
          ...(uploaded?.id ? { image: uploaded.id } : {}),
        },
        status: 'published',
      });
      created += 1;
    }
    if (created > 0) strapi.log.info(`[seed] Created ${created} dummy events.`);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// Grant the Public role read access to events so the frontend can list and
// open them anonymously.
async function seedPublicEventPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  const actions = ['api::event.event.find', 'api::event.event.findOne'];
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

// Wire the /events page (the nav already links to it): create it if missing,
// and add its Events List block unless the client has customised the content.
async function seedEventsPage(strapi: Core.Strapi) {
  const content = [
    {
      __component: 'blocks.rich-text' as const,
      body: '# Events\n\nTrade fairs, workshops, forums and networking events hosted by the Kiribati Chamber of Commerce & Industry.',
    },
    { __component: 'blocks.events-list' as const, title: null },
  ];

  const page = await strapi.documents(PAGE_UID).findFirst({
    filters: { slug: 'events' },
    populate: { content: { populate: '*' } },
  });

  if (!page) {
    await strapi.documents(PAGE_UID).create({
      data: { title: 'Events', slug: 'events', content },
      status: 'published',
    });
    strapi.log.info('[seed] Created the "events" page with an Events List block.');
    return;
  }

  const existingContent = page.content ?? [];
  if (existingContent.some((block) => block.__component === 'blocks.events-list')) return;

  const onlyPlaceholders = existingContent.every(
    (block) =>
      block.__component === 'blocks.rich-text' && (block.body ?? '').includes('Placeholder content'),
  );
  if (!onlyPlaceholders) {
    strapi.log.warn('[seed] Page "events" has custom content; add the Events List block manually.');
    return;
  }

  await strapi.documents(PAGE_UID).update({
    documentId: page.documentId,
    data: { content },
    status: 'published',
  });
  strapi.log.info('[seed] Added the Events List block to "events".');
}

// Seeded contact details for the /contact page — placeholders the client
// replaces with the Chamber's real phone/address in the Strapi admin.
const CONTACT_PAGE_CONTENT = [
  {
    __component: 'blocks.rich-text' as const,
    body: '# Contact Us\n\nGet in touch with the KCCI secretariat — we welcome enquiries from members, prospective members, partners and the media.',
  },
  {
    __component: 'blocks.contact' as const,
    title: 'Get in Touch',
    phone: '+686 75026572',
    email: 'secretariat@kcci.org.ki',
    address: 'KCCI Office, Betio\nSouth Tarawa\nRepublic of Kiribati',
    officeHours: 'Monday – Friday, 9:00 am – 4:30 pm',
    mapEmbedUrl: 'https://maps.google.com/maps?q=Betio,%20Tarawa,%20Kiribati&z=14&output=embed',
  },
];

// Wire the /contact page: create it if missing, and add its Contact block
// unless the client has already customised the page content.
async function seedContactPage(strapi: Core.Strapi) {
  const page = await strapi.documents(PAGE_UID).findFirst({
    filters: { slug: 'contact' },
    populate: { content: { populate: '*' } },
  });

  if (!page) {
    await strapi.documents(PAGE_UID).create({
      data: { title: 'Contact', slug: 'contact', content: CONTACT_PAGE_CONTENT },
      status: 'published',
    });
    strapi.log.info('[seed] Created the "contact" page with a Contact block.');
    return;
  }

  const existingContent = page.content ?? [];
  if (existingContent.some((block) => block.__component === 'blocks.contact')) return;

  const onlyPlaceholders = existingContent.every(
    (block) =>
      block.__component === 'blocks.rich-text' && (block.body ?? '').includes('Placeholder content'),
  );
  if (!onlyPlaceholders) {
    strapi.log.warn('[seed] Page "contact" has custom content; add the Contact block manually.');
    return;
  }

  await strapi.documents(PAGE_UID).update({
    documentId: page.documentId,
    data: { content: CONTACT_PAGE_CONTENT },
    status: 'published',
  });
  strapi.log.info('[seed] Added the Contact block to "contact".');
}

// Point the nav at the /contact page: repoint a legacy "#contact" anchor link
// (and drop duplicates), or append a flat link when absent.
async function seedContactNav(strapi: Core.Strapi) {
  const global = await strapi.documents(GLOBAL_UID).findFirst({
    populate: { navLinks: { populate: '*' } },
  });
  if (!global) return;

  const navLinks = global.navLinks ?? [];
  const isContactLink = (group: (typeof navLinks)[number]) =>
    group.url === '/contact' || group.url === '#contact' || /^contact( us)?$/i.test(group.label ?? '');
  const firstIndex = navLinks.findIndex(isContactLink);
  const desired = { label: 'Contact', url: '/contact', links: [] };

  const upToDate =
    firstIndex !== -1 &&
    navLinks.filter(isContactLink).length === 1 &&
    navLinks[firstIndex].label === desired.label &&
    navLinks[firstIndex].url === desired.url;
  if (upToDate) return;

  // Components must be re-sent in full (without ids) when updating.
  const kept = navLinks.filter((group, i) => !isContactLink(group) || i === firstIndex);
  const rebuilt = kept.map((group) => ({
    label: group.label,
    url: group.url,
    links: (group.links ?? []).map((link) => ({ label: link.label, url: link.url })),
  }));
  const contactIndex = kept.findIndex(isContactLink);
  if (contactIndex === -1) rebuilt.push(desired);
  else rebuilt[contactIndex] = desired;

  await strapi.documents(GLOBAL_UID).update({
    documentId: global.documentId,
    data: { navLinks: rebuilt },
    status: 'published',
  });
  strapi.log.info('[seed] Wired the "Contact" nav link.');
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
    await seedDummyPressReleases(strapi);
    await seedPressReleasePage(strapi);
    await seedPressReleaseNav(strapi);
    await seedPublicPressReleasePermissions(strapi);
    await seedDummyEvents(strapi);
    await seedEventsPage(strapi);
    await seedPublicEventPermissions(strapi);
    await seedContactPage(strapi);
    await seedContactNav(strapi);
  },
};
