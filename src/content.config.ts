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
    // Teaser image; defaults to the first image in the post
    image: z.string().optional(),
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
    // Former members: status alumni, optional year they left and where they are now
    status: z.enum(['current', 'alumni']).default('current'),
    until: z.number().int().optional(),
    now: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: md('./src/content/projects'),
  schema: z.object({
    title: z.string(),
    // One line for the project table
    summary: z.string(),
    funding: z.string().optional(),
    role: z.string().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
    status: z.enum(['active', 'completed']).default('active'),
    ended: z.coerce.date().optional(),
  }),
});

const topics = defineCollection({
  loader: md('./src/content/topics'),
  schema: z.object({
    title: z.string(),
    // Short name for menus and the home page
    label: z.string(),
    summary: z.string(),
    color: z.enum(['green', 'blue', 'red', 'yellow']),
    order: z.number(),
  }),
});

export const collections = {
  posts,
  jobs,
  team,
  projects,
  topics,
};
