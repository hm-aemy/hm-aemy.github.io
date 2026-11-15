# AEMY website

Source of [aemy.cs.hm.edu](https://aemy.cs.hm.edu), built with [Astro](https://astro.build).

## Adding content

All content is Markdown with a short front matter block. Open a pull request;
the build check validates the front matter and Netlify posts a preview link.

| What | Where | Front matter |
|---|---|---|
| News post | `src/content/posts/YYYY-MM-DD-slug.md` | `title`, `author`, `date`, optional `updated`, `subtitle`, `image` (teaser; default: first image in the post) |
| Cross-post (external blog) | `src/content/posts/YYYY-MM-DD-slug.md` | `layout: cross-post`, `title`, `author`, `date`, `source`, `external_url` |
| Job / thesis posting | `src/content/jobs/YYYY-MM-DD-slug.md` | `title`, `tag` (`staff`, `master`, `bachelor`, `student-assistant`), `contact`, optional `apply` |
| Team member | `src/content/team/first_last.md` + photo in `public/assets/img/` | `name`, `position`, `group` (`principals`, `phdstudents`, `students`), `photo` |
| Project page | `src/content/projects/name.md` | `title`, `summary` (one line for the project table), optional `funding`, `role`, `start`, `end`, `status: archived`, `ended` |
| Topic page | `src/content/topics/name.md` | `title`, `label` (short name), `summary`, `color` (`green`, `blue`, `red`, `yellow`), `order` |
| Publication | `src/data/publications.bib` | BibTeX entry |

- Images and other files go to `public/assets/...` and are linked as `/assets/...`.
- Link to other posts with their URL, e.g. `/2025/11/24/verilator-extension.html`.
- The navigation menu and site settings are in `src/config.ts`, the styles in `src/styles/site.css`.
- URLs: posts are published at `/YYYY/MM/DD/slug.html`, jobs at
  `/open-positions/YYYY/MM/DD/slug.html` (date from `date:` or the file name).

## Local development

Requires Node.js 24 (LTS) or newer.

```sh
npm install
npm run dev      # http://localhost:4321 with live reload
npm run build    # static site in dist/
```
