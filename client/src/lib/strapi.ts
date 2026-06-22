// Helpers for the SSR/native-fetch path against the Strapi 5 REST API.
// (Build-time collections use the Content Loader in src/content.config.ts.)

const STRAPI_BASE_URL = import.meta.env.STRAPI_BASE_URL ?? 'http://127.0.0.1:1337';

/**
 * Fetch a Strapi REST endpoint and return the flattened `data` payload.
 * `path` should start with `/api/...`. Returns `null` on any failure so
 * pages can degrade gracefully rather than throw during SSR.
 */
export async function fetchStrapi<T>(path: string): Promise<T | null> {
	try {
		const res = await fetch(`${STRAPI_BASE_URL}${path}`);
		if (!res.ok) return null;
		const json = (await res.json()) as { data?: T };
		return json.data ?? null;
	} catch {
		return null;
	}
}

/** Resolve a (possibly relative) Strapi media URL to an absolute one. */
export function mediaUrl(url: string | null | undefined): string | null {
	if (!url) return null;
	return url.startsWith('http') ? url : `${STRAPI_BASE_URL}${url}`;
}
