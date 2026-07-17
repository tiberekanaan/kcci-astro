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

export type Block =
	| HeroBlock
	| AboutSectionBlock
	| ServicesGridBlock
	| ToolkitGridBlock
	| CtaBlock;

export interface GlobalData {
	siteName: string | null;
	logo?: StrapiMedia | null;
	favicon?: StrapiMedia | null;
	navLinks?: SharedLink[] | null;
	footerLinks?: SharedLink[] | null;
}
