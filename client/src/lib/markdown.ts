// Convert Strapi `richtext` (Markdown source) into sanitized HTML for `set:html`.
// CMS content is authored by trusted staff, but we sanitize defensively since
// the output is injected as raw HTML during SSR.

import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const blockOptions: sanitizeHtml.IOptions = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		a: ['href', 'name', 'target', 'rel'],
		img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
	},
};

/** Render Markdown to sanitized block-level HTML (paragraphs, headings, lists, …). */
export function renderMarkdown(md: string | null | undefined): string {
	if (!md) return '';
	const html = marked.parse(md, { async: false });
	return sanitizeHtml(html, blockOptions);
}
