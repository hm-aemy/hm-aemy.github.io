import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export type Post = CollectionEntry<'posts'>;
export type Job = CollectionEntry<'jobs'>;

const FILENAME = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

/** Date of a post/job: front matter `date`, otherwise the date in the file name (like Jekyll). */
export function entryDate(entry: Post | Job): Date {
  if (entry.data.date) return entry.data.date;
  const m = entry.id.match(FILENAME);
  if (!m) throw new Error(`File name of ${entry.id} must start with YYYY-MM-DD-`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

export function entrySlug(entry: Post | Job): string {
  const m = entry.id.match(FILENAME);
  if (!m) throw new Error(`File name of ${entry.id} must start with YYYY-MM-DD-`);
  return m[4];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Path parts /YYYY/MM/DD/slug, matching Jekyll's default permalinks. */
export function datePath(entry: Post | Job) {
  const d = entryDate(entry);
  return {
    year: String(d.getUTCFullYear()),
    month: pad(d.getUTCMonth() + 1),
    day: pad(d.getUTCDate()),
    slug: entrySlug(entry),
  };
}

export function postUrl(entry: Post): string {
  const p = datePath(entry);
  return `/${p.year}/${p.month}/${p.day}/${p.slug}.html`;
}

export function jobUrl(entry: Job): string {
  const p = datePath(entry);
  return `/open-positions/${p.year}/${p.month}/${p.day}/${p.slug}.html`;
}

/** Format like Jekyll's date filter: %Y-%m-%d, or %Y-%m-%-d with short=true. */
export function formatDate(d: Date, short = false): string {
  const day = short ? String(d.getUTCDate()) : pad(d.getUTCDate());
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${day}`;
}

/** Newest first, like Jekyll's site.posts */
const byDateDesc = <T extends Post | Job>(a: T, b: T) =>
  entryDate(b).getTime() - entryDate(a).getTime() || a.id.localeCompare(b.id);

export async function getPosts() {
  return (await getCollection('posts')).sort(byDateDesc);
}

export async function getJobs() {
  return (await getCollection('jobs')).sort(byDateDesc);
}

/** First paragraph as plain text, truncated to n words (Jekyll's excerpt | strip_html | truncatewords). */
export function excerpt(body: string | undefined, words = 50): { text: string; more: boolean } {
  const src = (body ?? '').trim();
  const [first, ...rest] = src.split(/\n\s*\n/);
  const text = (first ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const list = text.split(' ').filter(Boolean);
  const truncated = list.length > words;
  return {
    text: truncated ? list.slice(0, words).join(' ') + '...' : text,
    more: truncated || rest.join('').trim().length > 0,
  };
}

/** Teaser image: front matter `image`, else the first /assets image in the post body. */
export function postImage(post: Post): string | undefined {
  if (post.data.image) return post.data.image;
  const m = (post.body ?? '').match(/(?:\]\(|src=")(\/assets\/[^)"\s]+\.(?:png|jpe?g|webp|gif))/i);
  return m?.[1];
}

export async function getTopics() {
  return (await getCollection('topics')).sort((a, b) => a.data.order - b.data.order);
}

const endTime = (p: Project) => (p.data.ended ?? p.data.end)?.getTime() ?? Infinity;

/** Projects, running ones first; within each group the latest ending first. */
export async function getProjects() {
  const all = (await getCollection('projects')).sort((a, b) => endTime(b) - endTime(a) || a.data.title.localeCompare(b.data.title));
  return {
    active: all.filter((p) => p.data.status !== 'completed'),
    completed: all.filter((p) => p.data.status === 'completed'),
  };
}

export function runtime(p: Project): string {
  const start = p.data.start?.getUTCFullYear();
  const end = (p.data.ended ?? p.data.end)?.getUTCFullYear();
  if (start && end) return `${start}–${end}`;
  if (end) return p.data.status === 'completed' ? `ended ${end}` : `until ${end}`;
  return '';
}

/** Short, human date: 15 Nov 2026 */
export function longDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
