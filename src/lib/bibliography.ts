import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';

import bib from '../data/publications.bib?raw';
import style from '../data/aemy.csl?raw';
plugins.config.get('@csl').styles.add('aemy', style);

export type Publication = { id: string; year: number; html: string };

/** All publications in file order, formatted with the AEMY CSL style. */
export function publications(): Publication[] {
  const cite = new Cite(bib);
  return cite.data.map((item: any) => {
    // Like the former jekyll-scholar output: conference address is shown as the event place
    if (item.type === 'paper-conference' && item['publisher-place'] && !item['event-place']) {
      item['event-place'] = item['publisher-place'];
    }
    const raw = new Cite(item).format('bibliography', { format: 'html', template: 'aemy', lang: 'en-US' }) as string;
    // Flatten citeproc's <div> wrappers and turn the style's markdown links (DOI) into <a>
    const html = raw
      .replace(/<\/?div[^>]*>/g, '')
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\bSept\./g, 'Sep.')
      .replace(/\bJune (?=\d{4})/g, 'Jun. ')
      .replace(/\bJuly (?=\d{4})/g, 'Jul. ')
      .replace(/\s*\n\s*/g, ' ')
      .trim();
    const year = item.issued?.['date-parts']?.[0]?.[0] ?? 0;
    return { id: item.id, year: Number(year), html };
  });
}
