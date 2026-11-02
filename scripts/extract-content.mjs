// Extracts page and blog content from the legacy WordPress site into Markdown.
//
// Usage: node scripts/extract-content.mjs
//
// Writes:
//   src/content/pages/<url-path>.md   one file per page, rendered by src/pages/[...slug].astro
//   src/content/blog/<slug>.md        one file per blog post, rendered under /blog/
//   src/assets/legacy/                images downloaded from the WordPress uploads folder
//   docs/amf-site-content.md          single combined Markdown file of everything extracted
//
// Internal links become site-relative paths (/practice/mediation/) and images are
// referenced by their relative path inside src/assets, so no output points at the live site.

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://amf-familylaw.com';
const sitemapUrl = `${siteUrl}/page.xml`;
const assetDir = join(root, 'src/assets/legacy');

// The blog was flooded with casino spam starting 2015-01-01. Only posts published
// before that date are genuine law-firm articles.
const blogCutoff = '2015-01-01T00:00:00';

// Pages that exist only as casino spam and contain no firm content.
const spamPages = {
  'stories/featured/2024/betprimeiro-vollstandiger-uberblick-uber-das-online-casino-fur-osterreichische-s':
    'casino spam',
  'unique-features-that-set-white-rabbit-casino-apart': 'casino spam',
};

// Pages kept in the Markdown output but not rendered as routes.
const unrouted = {
  '': 'home page is served by src/pages/index.astro',
  blog: 'blog index is generated from the blog collection',
  test_test: 'draft test page',
};

// Filler left on the home page after the firm's badges (not caught by the spam
// patterns). Everything from this line onward is dropped.
const homeFillerMarker = 'Lorem ipsum';

// Spam is injected as <div> blocks of casino or link-farm text.
const spamPattern =
  /casino|jackpot|\bslots?\b|poker|free spins|sportsbook|kokol|chicken road|fortune gems|betting|\bbonus\b.*\b(deposit|spins?)\b/i;

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function decodeEntities(text) {
  const { document } = parseHTML(`<html><body><p>${text}</p></body></html>`);
  return normalizeText(document.querySelector('p').textContent);
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

function isOwnDomain(href) {
  try {
    return new URL(href, siteUrl).hostname.replace(/^www\./, '') === 'amf-familylaw.com';
  } catch {
    return false;
  }
}

// Site-relative form of a link on this domain, e.g. /practice/mediation/#intro.
function siteRelative(href) {
  const url = new URL(href, siteUrl);
  return `${url.pathname}${url.search}${url.hash}`;
}

function urlPath(link) {
  return new URL(link).pathname.replace(/^\/+|\/+$/g, '');
}

// WordPress serves thumbnails such as photo-300x200.jpg. The full-size file has no size suffix.
function fullSizeUrl(src) {
  return src.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');
}

function localFileName(src) {
  const name = decodeURIComponent(new URL(src).pathname.split('/').pop());
  return name.replace(/[^A-Za-z0-9._-]/g, '-');
}

// Maps each WordPress image URL to the local file name it is saved under.
const assetNames = new Map();

function imageSources(html) {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  return [...document.querySelectorAll('img[src]')]
    .map((img) => img.getAttribute('src'))
    .filter((src) => /^https?:\/\//.test(src));
}

async function downloadImages(sources) {
  for (const src of new Set(sources)) {
    if (assetNames.has(src)) continue;
    // Only WordPress thumbnails have a full-size variant to try first.
    const candidates = isOwnDomain(src) ? [fullSizeUrl(src), src] : [src];
    for (const candidate of candidates) {
      const res = await fetch(candidate);
      if (!res.ok) continue;
      const name = localFileName(candidate);
      await writeFile(join(assetDir, name), Buffer.from(await res.arrayBuffer()));
      assetNames.set(src, name);
      console.log(`image: ${candidate} -> src/assets/legacy/${name}`);
      break;
    }
    if (!assetNames.has(src)) console.log(`image not downloaded: ${src}`);
  }
}

// Strips injected spam blocks and converts the remaining HTML to Markdown.
// Images are written as local-asset:<name> tokens, resolved per file by localizeAssets.
// Returns the Markdown plus the spam text that was removed, for review.
function htmlToMarkdown(html, knownPaths) {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const removed = [];

  for (const el of document.querySelectorAll('script, style, noscript, iframe')) {
    el.remove();
  }

  // Spam is hidden off-screen (position:absolute; left:-NNNNpx), so readers never see it.
  for (const el of [...document.querySelectorAll('[style]')]) {
    const style = el.getAttribute('style');
    if (/position:\s*absolute/.test(style) && /left:\s*-\d{3,}px/.test(style)) {
      removed.push(`[hidden] ${normalizeText(el.textContent)}`.slice(0, 160));
      el.remove();
    }
  }

  // Spam links point at unrelated casino slugs on this domain. Keep only links
  // to pages and posts that exist in the sitemap or the blog set, as site-relative paths.
  for (const link of [...document.querySelectorAll('a[href]')]) {
    const href = link.getAttribute('href');
    const isSpam = spamPattern.test(href) || (isOwnDomain(href) && !knownPaths.has(urlPath(href)));
    if (isSpam) {
      removed.push(`[link] ${href}`.slice(0, 160));
      link.remove();
    } else if (isOwnDomain(href)) {
      link.setAttribute('href', siteRelative(href));
    }
  }

  for (const img of [...document.querySelectorAll('img[src]')]) {
    const src = img.getAttribute('src');
    if (assetNames.has(src)) img.setAttribute('src', `local-asset:${assetNames.get(src)}`);
  }

  // Walk deepest-first so only the lowest element holding spam is removed,
  // never a wrapper that also holds the firm's own copy.
  const elements = [...document.body.querySelectorAll('*')].reverse();
  for (const el of elements) {
    if (!el.isConnected) continue;
    const text = normalizeText(el.textContent);
    if (!spamPattern.test(text)) continue;
    if ([...el.children].some((child) => spamPattern.test(normalizeText(child.textContent)))) continue;
    removed.push(text.slice(0, 160));
    el.remove();
  }

  // Bare live-site URLs left in the text (such as a pasted wp-admin link) are not content.
  const markdown = turndown
    .turndown(document.body.innerHTML)
    .replace(/^https?:\/\/(www\.)?amf-familylaw\.com\S*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { markdown, removed };
}

// Replaces local-asset tokens with paths relative to the file being written.
function localizeAssets(markdown, fromDir) {
  return markdown.replace(/local-asset:([A-Za-z0-9._-]+)/g, (_, name) => {
    const path = relative(fromDir, join(assetDir, name)).split(sep).join('/');
    return path.startsWith('.') ? path : `./${path}`;
  });
}

function excerptOf(markdown) {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}...` : plain;
}

function yamlString(value) {
  return JSON.stringify(value);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function fetchPageUrls() {
  const res = await fetch(sitemapUrl);
  if (!res.ok) throw new Error(`${sitemapUrl} -> HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const sitemapUrls = await fetchPageUrls();
  const wpPages = await fetchJson(
    `${siteUrl}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title,date,modified,content`,
  );
  const wpPageByPath = new Map(wpPages.map((p) => [urlPath(p.link), p]));

  const blogPosts = await fetchJson(
    `${siteUrl}/wp-json/wp/v2/posts?per_page=100&orderby=date&order=asc&before=${blogCutoff}&_fields=id,slug,link,title,date,modified,content`,
  );

  const knownPaths = new Set([...sitemapUrls, ...blogPosts.map((post) => post.link)].map(urlPath));

  await rm(assetDir, { recursive: true, force: true });
  await mkdir(assetDir, { recursive: true });
  const allImages = [...wpPages, ...blogPosts].flatMap((item) => imageSources(item.content.rendered));
  await downloadImages(allImages);

  const pages = [];
  const skipped = [];
  const spamRemoved = [];

  for (const url of sitemapUrls) {
    const path = urlPath(url);
    const wp = wpPageByPath.get(path);
    if (!wp) {
      skipped.push({ url, reason: 'not returned by the WordPress pages API' });
      continue;
    }
    if (spamPages[path]) {
      skipped.push({ url, reason: spamPages[path] });
      continue;
    }

    const converted = htmlToMarkdown(wp.content.rendered, knownPaths);
    spamRemoved.push(...converted.removed.map((text) => ({ url, text })));
    let markdown = converted.markdown;
    if (path === '' && markdown.includes(homeFillerMarker)) {
      markdown = markdown.slice(0, markdown.indexOf(homeFillerMarker)).trimEnd();
    }
    pages.push({
      path,
      route: `/${path ? `${path}/` : ''}`,
      title: decodeEntities(wp.title.rendered),
      modified: wp.modified,
      markdown,
      description: excerptOf(markdown),
      draft: path === 'test_test',
      routed: !(path in unrouted),
    });
  }

  const posts = blogPosts.map((post) => {
    const { markdown, removed } = htmlToMarkdown(post.content.rendered, knownPaths);
    spamRemoved.push(...removed.map((text) => ({ url: post.link, text })));
    return {
      slug: post.slug,
      route: `/blog/${post.slug}/`,
      title: decodeEntities(post.title.rendered),
      date: post.date,
      modified: post.modified,
      markdown,
      description: excerptOf(markdown),
    };
  });

  const pagesDir = join(root, 'src/content/pages');
  const blogDir = join(root, 'src/content/blog');
  await rm(pagesDir, { recursive: true, force: true });
  await rm(blogDir, { recursive: true, force: true });

  for (const page of pages) {
    const file = join(pagesDir, `${page.path || 'index'}.md`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      file,
      [
        '---',
        `title: ${yamlString(page.title)}`,
        `description: ${yamlString(page.description)}`,
        `route: ${yamlString(page.route)}`,
        `modified: ${yamlString(page.modified)}`,
        `draft: ${page.draft}`,
        '---',
        '',
        localizeAssets(page.markdown, dirname(file)),
        '',
      ].join('\n'),
    );
  }

  await mkdir(blogDir, { recursive: true });
  for (const post of posts) {
    const file = join(blogDir, `${post.slug}.md`);
    await writeFile(
      file,
      [
        '---',
        `title: ${yamlString(post.title)}`,
        `description: ${yamlString(post.description)}`,
        `route: ${yamlString(post.route)}`,
        `date: ${yamlString(post.date)}`,
        `modified: ${yamlString(post.modified)}`,
        '---',
        '',
        localizeAssets(post.markdown, dirname(file)),
        '',
      ].join('\n'),
    );
  }

  const docsDir = join(root, 'docs');
  const combined = [
    '# Law Offices of Annette M. Fernholz, P.C. - Site Content',
    '',
    'Extracted from the legacy WordPress site. Casino spam blocks injected into the source were removed.',
    '',
    '## Pages',
    '',
    ...pages.flatMap((page) => [
      `### ${page.title}`,
      '',
      `Route: ${page.route}`,
      '',
      localizeAssets(page.markdown, docsDir),
      '',
      '---',
      '',
    ]),
    '## Blog posts',
    '',
    ...posts.flatMap((post) => [
      `### ${post.title}`,
      '',
      `Route: ${post.route} (${post.date.slice(0, 10)})`,
      '',
      localizeAssets(post.markdown, docsDir),
      '',
      '---',
      '',
    ]),
  ].join('\n');

  await mkdir(docsDir, { recursive: true });
  await writeFile(join(docsDir, 'amf-site-content.md'), combined);

  console.log(`pages written: ${pages.length} (routed: ${pages.filter((p) => p.routed).length})`);
  console.log(`blog posts written: ${posts.length}`);
  console.log(`images downloaded: ${assetNames.size}`);
  console.log(`spam blocks removed: ${spamRemoved.length}`);
  for (const item of skipped) console.log(`skipped: ${item.url} (${item.reason})`);
  if (process.env.SHOW_SPAM) {
    for (const item of spamRemoved) console.log(`removed [${item.url}]: ${item.text}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
