// Path under /public (e.g. '/logo-amffamilylaw.svg'). Leave null to show the AMF monogram.
export const logo: string | null = null;
export const firmName = 'Law Offices of Annette M. Fernholz, P.C.';

export const contact = {
  phone: {
    display: '312.683.0308',
    href: 'tel:+13126830308',
  },
  address: {
    lines: ['211 West Wacker Dr, Ste 1100', 'Chicago, IL 60606'],
    full: '211 West Wacker Dr, ste 1100, Chicago, IL 60606',
  },
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=Law%20Offices%20of%20Annette%20M.%20Fernholz%2C%20P.C.%2C%20211%20W%20Wacker%20Dr%20Ste%201100%2C%20Chicago%2C%20IL%2060606',
};

// Primary call to action. Every "start a conversation" button on the site reads from here
// and links to the Connect with Annette form (/contact/).
export const cta = {
  label: 'Connect with Annette to discuss your appeal',
  short: 'Connect with Annette',
  href: '/contact/',
};

export const practiceLinks = [
  { label: 'Divorce', href: '/practice/divorce-attorney/' },
  { label: 'Child Custody', href: '/practice/child-custody-attorney/' },
  { label: 'Child Support', href: '/practice/child-support-attorney/' },
  { label: 'Maintenance & Spousal Support', href: '/practice/maintenance-and-spousal-support/' },
  { label: 'Prenuptial & Post-Nuptial Agreements', href: '/practice/prenuptial-post-nuptial-agreements/' },
  { label: 'College Contribution', href: '/practice/college-contribution/' },
  { label: 'Mediation', href: '/practice/mediation/' },
  { label: 'Collaborative Law', href: '/practice/collaborative-law/' },
  { label: 'Family Law Appeals', href: '/practice/family-law-appeal/' },
  { label: 'Post-Decree Modifications', href: '/practice/post-decree-modifications-and-enforcement/' },
  { label: 'Same-Sex Marriage & Civil Unions', href: '/chicago-same-sex-marriage-and-civil-union-attorney/' },
];

// Practice areas sorted into families for the header mega-menu. Labels and links come from practiceLinks.
const byLabel = (label: string) => practiceLinks.find((l) => l.label === label)!;
export const practiceGroups = [
  { label: 'Divorce & Property', items: ['Divorce', 'Maintenance & Spousal Support', 'Prenuptial & Post-Nuptial Agreements', 'Same-Sex Marriage & Civil Unions'].map(byLabel) },
  { label: 'Children & Family', items: ['Child Custody', 'Child Support', 'College Contribution'].map(byLabel) },
  { label: 'Resolution Paths', items: ['Mediation', 'Collaborative Law'].map(byLabel) },
  { label: 'Appeals & Post-Decree', items: ['Family Law Appeals', 'Post-Decree Modifications'].map(byLabel) },
];

export const firmLinks = [
  { label: 'About the Firm', href: '/about/firm/' },
  { label: 'Attorney Profile', href: '/about/attorney/' },
  { label: 'Testimonials', href: '/about/testimonials/' },
  { label: 'FAQs', href: '/faqs/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Privacy Policy', href: '/privacy/' },
];

export const aboutLinks = [
  { label: 'About the Firm', href: '/about/firm/' },
  { label: 'Attorney Profile', href: '/about/attorney/' },
  { label: 'Testimonials', href: '/about/testimonials/' },
];

export const navMenu = [
  { label: 'Practice Areas', href: '/practice/', children: practiceLinks, mega: true },
  { label: 'About', href: '/about/', children: aboutLinks },
  { label: 'FAQs', href: '/faqs/' },
  { label: 'Blog', href: '/blog/' },
];

// AI assistant. Flip `enabled` once the chatbot widget is embedded; every "Chat with our assistant"
// button then appears. Buttons dispatch `amf:open-chat` on `window` for the widget to listen to.
export const chat = {
  enabled: false,
  label: 'Chat with our assistant',
};

export const offices = [
  {
    name: 'Downtown Chicago',
    note: '',
    lines: ['211 W Wacker Dr, Ste 1100', 'Chicago, IL 60606'],
    // Business name first so Google resolves the listing instead of dropping a plain pin.
    query: 'Law Offices of Annette M. Fernholz, P.C., 211 W Wacker Dr Ste 1100, Chicago, IL 60606',
    // Optional: paste the src from Google Maps > Share > Embed a map to pin the exact listing.
    embedSrc: '',
  },
  {
    name: 'Northbrook',
    note: 'By appointment only',
    lines: ['707 Skokie Blvd', 'Northbrook, IL 60062'],
    query: '707 Skokie Blvd, Northbrook, IL 60062',
    embedSrc: '',
  },
];

export const mapEmbedSrc = (query: string) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
export const mapLinkHref = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
