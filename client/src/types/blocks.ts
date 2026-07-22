// Types for Strapi 5 dynamic-zone blocks and shared components.
// Strapi 5 responses are flattened (no `.attributes` wrapper); entries and
// components carry a numeric `id`, content entries also a 24-char `documentId`.

export interface StrapiMedia {
	url: string;
	alternativeText?: string | null;
	width?: number | null;
	height?: number | null;
}

export interface SharedButton {
	id: number;
	label: string | null;
	url: string | null;
	isExternal?: boolean | null;
}

export interface SharedLink {
	id: number;
	label: string | null;
	url: string | null;
}

export interface NavGroup {
	id: number;
	label: string | null;
	url?: string | null;
	links?: SharedLink[] | null;
}

export interface ServiceItem {
	id: number;
	title: string | null;
	description: string | null;
	bulletPoints: string | null;
}

export interface ToolItem {
	id: number;
	title: string | null;
	description: string | null;
}

export interface HeroBlock {
	__component: 'blocks.hero';
	id: number;
	title: string | null;
	subtitle: string | null;
	buttons?: SharedButton[] | null;
	backgroundImage?: StrapiMedia | null;
}

export interface AboutSectionBlock {
	__component: 'blocks.about-section';
	id: number;
	whoWeAre: string | null;
	vision: string | null;
	mission: string | null;
}

export interface ServicesGridBlock {
	__component: 'blocks.services-grid';
	id: number;
	title: string | null;
	services?: ServiceItem[] | null;
}

export interface ToolkitGridBlock {
	__component: 'blocks.toolkit-grid';
	id: number;
	title: string | null;
	subtitle: string | null;
	tools?: ToolItem[] | null;
	ctaButton?: SharedButton | null;
}

export interface CtaBlock {
	__component: 'blocks.cta';
	id: number;
	title: string | null;
	description: string | null;
	button?: SharedButton | null;
	image?: StrapiMedia | null;
	imagePosition?: 'right' | 'left' | null;
}

export interface Member {
	id: number;
	documentId: string;
	name: string | null;
	role: string | null;
	bio: string | null;
	memberType: 'board' | 'executive' | null;
	order?: number | null;
	image?: StrapiMedia | null;
}

export interface MembersGridBlock {
	__component: 'blocks.members-grid';
	id: number;
	title: string | null;
	memberType: 'board' | 'executive' | null;
}

export interface Resource {
	id: number;
	documentId: string;
	title: string | null;
	type: 'Document' | 'Link' | 'Video' | null;
	category: 'regulations' | 'internal' | 'external' | null;
	description: string | null;
	externalLink: string | null;
	file?: (StrapiMedia & { name?: string | null; ext?: string | null; size?: number | null }) | null;
}

export interface ResourcesListBlock {
	__component: 'blocks.resources-list';
	id: number;
	title: string | null;
	category?: 'regulations' | 'internal' | 'external' | null;
}

export interface PressRelease {
	id: number;
	documentId: string;
	title: string | null;
	slug: string | null;
	date: string | null;
	excerpt: string | null;
	content: string | null;
	category: 'news' | 'announcement' | 'event' | null;
	coverImage?: StrapiMedia | null;
}

export interface PressReleasesListBlock {
	__component: 'blocks.press-releases-list';
	id: number;
	title: string | null;
}

// Named EventItem to avoid clashing with the DOM `Event` type.
export interface EventItem {
	id: number;
	documentId: string;
	title: string | null;
	slug: string | null;
	date: string | null;
	location: string | null;
	description: string | null;
	image?: StrapiMedia | null;
}

export interface EventsListBlock {
	__component: 'blocks.events-list';
	id: number;
	title: string | null;
}

export interface ContactBlock {
	__component: 'blocks.contact';
	id: number;
	title: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	officeHours: string | null;
	mapEmbedUrl: string | null;
}

export interface RichTextBlock {
	__component: 'blocks.rich-text';
	id: number;
	body: string | null;
}

export type Block =
	| HeroBlock
	| AboutSectionBlock
	| ServicesGridBlock
	| ToolkitGridBlock
	| CtaBlock
	| RichTextBlock
	| MembersGridBlock
	| ResourcesListBlock
	| PressReleasesListBlock
	| EventsListBlock
	| ContactBlock;

export interface GlobalData {
	siteName: string | null;
	logo?: StrapiMedia | null;
	favicon?: StrapiMedia | null;
	navLinks?: NavGroup[] | null;
	footerLinks?: SharedLink[] | null;
}
