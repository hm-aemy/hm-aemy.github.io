import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Keep file names as ids (no lowercasing), so URLs stay as they were with Jekyll
const md = (base: string) =>
  glob({ base, pattern: '**/*.md', generateId: ({ entry }) => entry.replace(/\.md$/, '') });

const posts = defineCollection({
  loader: md('./src/content/posts'),
  schema: z.object({
    layout: z.enum(['post', 'cross-post']).default('post'),
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    // cross-posts only
    source: z.string().optional(),
    external_url: z.string().url().optional(),
  }),
});

const jobs = defineCollection({
  loader: md('./src/content/jobs'),
  schema: z.object({
    layout: z.literal('job').default('job'),
    title: z.string(),
    tag: z.enum(['staff', 'master', 'bachelor', 'student-assistant']),
    contact: z.string().email(),
    apply: z.string().url().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
  }),
});

const team = defineCollection({
  loader: md('./src/content/team'),
  schema: z.object({
    name: z.string(),
    position: z.string(),
    group: z.enum(['principals', 'phdstudents', 'students']),
    photo: z.string(),
  }),
});

const pages = (base: string) =>
  defineCollection({
    loader: md(base),
    schema: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      status: z.enum(['active', 'archived']).optional(),
      ended: z.coerce.date().optional(),
    }).passthrough(),
  });

export const collections = {
  posts,
  jobs,
  team,
  projects: pages('./src/content/projects'),
  topics: pages('./src/content/topics'),
};
