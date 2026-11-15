// Site-wide settings (formerly _config.yml)
export const site = {
  title: 'AEMY',
  url: 'https://aemy.cs.hm.edu',
  avatar: '/assets/img/aemy-avatar.svg',
};

type NavLink = { label: string; href: string };
type NavMenu = { label: string; children: NavLink[] };

// Main navigation. Add new project pages under "Projects".
export const navbar: (NavLink | NavMenu)[] = [
  {
    label: 'Topics',
    children: [
      { label: 'RISC-V ISA Extensions', href: '/topics/risc-v-extensions' },
      { label: 'Open Source Chip Design', href: '/topics/open-source-chip-design' },
      { label: 'WebAssembly for Embedded', href: '/topics/wasm4iot' },
      { label: 'Formal Methods for Embedded', href: '/topics/formal-embedded' },
    ],
  },
  {
    label: 'Projects',
    children: [
      { label: 'ISOLDE', href: '/projects/isolde' },
      { label: 'Scale4Edge', href: '/projects/scale4edge' },
      { label: 'DI-OSVISE', href: '/projects/osvise' },
      { label: 'DI-OCDCpro', href: '/projects/ocdcpro' },
      { label: 'BCDC', href: '/projects/bcdc' },
      { label: 'TIZIO', href: '/projects/tizio' },
    ],
  },
  { label: 'Publications', href: '/publications' },
  { label: 'Posts', href: '/posts' },
  { label: 'Open Positions', href: '/open-positions' },
  { label: 'Team', href: '/team' },
];
