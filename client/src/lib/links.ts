interface LinkButton {
	url?: string | null;
	isExternal?: boolean | null;
}

interface LinkAttrs {
	href: string;
	target: '_blank' | undefined;
	rel: 'noopener noreferrer' | undefined;
}

/**
 * Editors sometimes enter external URLs without a scheme (e.g. "www.example.com"),
 * which the browser would resolve relative to the current page. Prepend https://
 * when the value looks like a bare hostname; leave site paths and anchors alone.
 */
export function normalizeUrl(url?: string | null): string {
	const trimmed = url?.trim();
	if (!trimmed) return '#';
	if (/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(trimmed)) return trimmed;
	const firstSegment = trimmed.split('/')[0] ?? '';
	return firstSegment.includes('.') ? `https://${trimmed}` : trimmed;
}

/** href/target/rel for a Strapi button; external links open in a new tab. */
export function buttonLinkAttrs(button?: LinkButton | null): LinkAttrs {
	const href = normalizeUrl(button?.url);
	const external = Boolean(button?.isExternal) || /^https?:\/\//i.test(href);
	return {
		href,
		target: external ? '_blank' : undefined,
		rel: external ? 'noopener noreferrer' : undefined,
	};
}
