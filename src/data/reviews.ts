// Google Business Profile reviews, newest first. Leave `reviews` empty to hide the section.
export interface Review {
  /** First name and last initial only, e.g. "Ryan B." */
  name: string;
  /** 1 to 5. Omit to show the card without stars. */
  rating?: number;
  text: string;
  /** Text was cut off on Google ("... More"); the card links out for the rest. */
  truncated?: boolean;
  /** Optional: reviewer's Google profile photo URL. Initials are shown when omitted. */
  photo?: string;
}

export const reviewSummary = {
  rating: undefined as number | undefined,
  count: 0,
  // Link to your Google reviews, e.g. https://g.page/r/XXXX/review
  href: 'https://www.google.com/search?q=Law+Offices+of+Annette+M.+Fernholz%2C+P.C.',
};

export const reviews: Review[] = [
  {
    name: 'R. G.',
    text: 'Great candor and straight-forward advice! Incredibly helpful to understanding the appeal process and costs (financial and emotional) involved. No BS here, which is a breath of fresh air in the legal world.',
  },
  {
    name: 'Priscilla D.',
    text: 'Annette is a master of her craft! She\'s not "frilly", let\'s you know what you need to know quickly and succinctly, VERY reasonable rates for the EXCELLENT quality of work. I won my appeal as a result of her diligence and precise, on-point',
    truncated: true,
  },
  {
    name: 'Ryan B.',
    text: 'Solid. Will always use her. Definitely recommend. Divorce and post divorce child custody',
  },
  {
    name: 'Leonard M.',
    text: 'As my attorney Annette Fernholz has been in my corner for almost 15 years, from the time of my divorce, through child support negotiations, and even now that my daughter is in college. She is effective (we won every motion), efficient (turns things around quickly and doesn’t consume my time unnecessarily) and has always managed my expectations in an honest and realistic manner – something I have highly valued given the emotions of family law. She has kept me focused, encouraged me to pursue my best interests when appropriate and leveled with me the times I needed to let go. I have recommended her to many others, all of whom are grateful that I did.',
  },
];
