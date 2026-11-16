// Site-wide settings
export const site = {
  title: 'AEMY',
  name: 'Safe, Secure and Smart Systems',
  org: 'Hochschule München · FK07',
  url: 'https://aemy.cs.hm.edu',
  logo: '/assets/img/aemy.svg',
  shareImage: '/assets/img/aemy-avatar.svg',
  contact: 'stefan.wallentowitz@hm.edu',
  address: 'Hochschule München University of Applied Sciences · Faculty of Computer Science and Mathematics · Lothstraße 64, 80335 München',
  github: 'https://github.com/hm-aemy',
};

// Main navigation; `highlight` shows the entry as a button (call to action)
export const navbar: { label: string; href: string; highlight?: boolean }[] = [
  { label: 'Topics', href: '/topics/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Publications', href: '/publications' },
  { label: 'News', href: '/posts' },
  { label: 'Team', href: '/team' },
  { label: 'Open Positions', href: '/open-positions/', highlight: true },
];

// Key partners, shown in the logo carousel on the home page (logos in public/assets/img/partners/).
// Displayed in alphabetical order, regardless of the order here.
export const partners = [
  { name: 'Antmicro', logo: '/assets/img/partners/antmicro.svg', url: 'https://antmicro.com' },
  { name: 'Fraunhofer', logo: '/assets/img/partners/fraunhofer.svg', url: 'https://www.fraunhofer.de' },
  { name: 'Infineon', logo: '/assets/img/partners/infineon.svg', url: 'https://www.infineon.com' },
  { name: 'Quintauris', logo: '/assets/img/partners/quintauris.svg', url: 'https://www.quintauris.com' },
  { name: 'TASKING', logo: '/assets/img/partners/tasking.svg', url: 'https://www.tasking.com' },
  { name: 'Western Digital', logo: '/assets/img/partners/western-digital.svg', url: 'https://www.westerndigital.com' },
].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
