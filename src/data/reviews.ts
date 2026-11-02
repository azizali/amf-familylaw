// Google Business Profile reviews and client testimonials, shown in one Google-style list. Leave `reviews` empty to hide the section.
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
  {
    name: 'Marius',
    text: 'Annette helped me gain sole custody of my son. She helped me become a better parent.',
  },
  {
    name: 'Trisha',
    text: 'There are not enough words to describe Annette Fernholz.  She is the best attorney you could ask for. From the first time I met her over 10 years ago when I started my divorce, she has stood by my side, and has always kept me informed as to what was going on.  She is personable and a no holds barred type of attorney you want on your side.  Every time I met with her, I always walked away knowing we would win, and that we did.  She made me feel so confident about everything starting with my divorce and right through until today when she is still fighting for me for my child support. She is top notch and will never let you down.',
  },
  {
    name: 'Susan B.',
    text: 'Annette specializes in Family Law and over the last couple of years has helped me with a number of post-decree matters.  The trickiest was a temporary relocation with my daughter overseas (doesn’t get much harder than that in the custody world), but she also handled my suit to raise child support and collect medical expense arrears.  I’ve won in each case and the fees were not unreasonable.  She’s down to earth and sensible and will tell you when to cut your losses and when to lose the attitude.',
  },
];
