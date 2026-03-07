// utils/categorizer.js
// Maps a domain to a { category, subcategory } pair.
// Priority order: user override → exact domain match → suffix match → path heuristic → Other

import { storageGet } from "./storage.js";

export const CATEGORIES = {
  TECHNOLOGY: "Technology",
  READING:    "Reading",
  ACADEMIA:   "Academia",
  SOCIAL:     "Social",
  OTHER:      "Other",
};

export const SUBCATEGORIES = {
  DOCUMENTATION: "Documentation",
  TUTORIALS:     "Tutorials & Courses",
  DEV_BLOGS:     "Dev Blogs",
  TECH_NEWS:     "Tech News",
  BLOGS:         "Blogs & Newsletters",
  NEWS:          "News & Media",
  EBOOKS:        "eBooks & Literature",
  RESEARCH:      "Research Papers",
  JOURNALS:      "Academic Journals",
  SOCIAL_MEDIA:  "Social Media",
  FORUMS:        "Forums & Communities",
  OTHER:         "Uncategorized",
};

// Maps each subcategory to its parent category
export const SUBCATEGORY_TO_CATEGORY = {
  [SUBCATEGORIES.DOCUMENTATION]: CATEGORIES.TECHNOLOGY,
  [SUBCATEGORIES.TUTORIALS]:     CATEGORIES.TECHNOLOGY,
  [SUBCATEGORIES.DEV_BLOGS]:     CATEGORIES.TECHNOLOGY,
  [SUBCATEGORIES.TECH_NEWS]:     CATEGORIES.TECHNOLOGY,
  [SUBCATEGORIES.BLOGS]:         CATEGORIES.READING,
  [SUBCATEGORIES.NEWS]:          CATEGORIES.READING,
  [SUBCATEGORIES.EBOOKS]:        CATEGORIES.READING,
  [SUBCATEGORIES.RESEARCH]:      CATEGORIES.ACADEMIA,
  [SUBCATEGORIES.JOURNALS]:      CATEGORIES.ACADEMIA,
  [SUBCATEGORIES.SOCIAL_MEDIA]:  CATEGORIES.SOCIAL,
  [SUBCATEGORIES.FORUMS]:        CATEGORIES.SOCIAL,
  [SUBCATEGORIES.OTHER]:         CATEGORIES.OTHER,
};

const D = SUBCATEGORIES; // shorthand for the map below

// Exact domain → subcategory
const DOMAIN_MAP = {
  // Documentation
  "developer.mozilla.org":      D.DOCUMENTATION,
  "devdocs.io":                 D.DOCUMENTATION,
  "readthedocs.io":             D.DOCUMENTATION,
  "readthedocs.org":            D.DOCUMENTATION,
  "docs.python.org":            D.DOCUMENTATION,
  "docs.djangoproject.com":     D.DOCUMENTATION,
  "docs.github.com":            D.DOCUMENTATION,
  "docs.docker.com":            D.DOCUMENTATION,
  "docs.aws.amazon.com":        D.DOCUMENTATION,
  "cloud.google.com":           D.DOCUMENTATION,
  "learn.microsoft.com":        D.DOCUMENTATION,
  "developer.apple.com":        D.DOCUMENTATION,
  "developer.android.com":      D.DOCUMENTATION,
  "react.dev":                  D.DOCUMENTATION,
  "reactjs.org":                D.DOCUMENTATION,
  "vuejs.org":                  D.DOCUMENTATION,
  "angular.io":                 D.DOCUMENTATION,
  "nodejs.org":                 D.DOCUMENTATION,
  "kotlinlang.org":             D.DOCUMENTATION,
  "docs.rs":                    D.DOCUMENTATION,
  "pkg.go.dev":                 D.DOCUMENTATION,
  "cppreference.com":           D.DOCUMENTATION,
  "ruby-doc.org":               D.DOCUMENTATION,
  "docs.oracle.com":            D.DOCUMENTATION,
  "php.net":                    D.DOCUMENTATION,
  "docs.swift.org":             D.DOCUMENTATION,
  "learn.svelte.dev":           D.DOCUMENTATION,
  "nextjs.org":                 D.DOCUMENTATION,
  "nuxt.com":                   D.DOCUMENTATION,
  "laravel.com":                D.DOCUMENTATION,
  "spring.io":                  D.DOCUMENTATION,
  "docs.stripe.com":            D.DOCUMENTATION,
  "tailwindcss.com":            D.DOCUMENTATION,
  "getbootstrap.com":           D.DOCUMENTATION,
  "mui.com":                    D.DOCUMENTATION,

  // Tutorials & Courses
  "freecodecamp.org":           D.TUTORIALS,
  "theodinproject.com":         D.TUTORIALS,
  "w3schools.com":              D.TUTORIALS,
  "codecademy.com":             D.TUTORIALS,
  "coursera.org":               D.TUTORIALS,
  "udemy.com":                  D.TUTORIALS,
  "edx.org":                    D.TUTORIALS,
  "khanacademy.org":            D.TUTORIALS,
  "pluralsight.com":            D.TUTORIALS,
  "egghead.io":                 D.TUTORIALS,
  "frontendmasters.com":        D.TUTORIALS,
  "css-tricks.com":             D.TUTORIALS,
  "javascript.info":            D.TUTORIALS,
  "scrimba.com":                D.TUTORIALS,

  // Dev Blogs
  "medium.com":                 D.DEV_BLOGS,
  "dev.to":                     D.DEV_BLOGS,
  "hashnode.com":               D.DEV_BLOGS,
  "ghost.io":                   D.DEV_BLOGS,
  "overreacted.io":             D.DEV_BLOGS,
  "martinfowler.com":           D.DEV_BLOGS,
  "kentcdodds.com":             D.DEV_BLOGS,
  "paulgraham.com":             D.DEV_BLOGS,
  "joel.io":                    D.DEV_BLOGS,
  "swyx.io":                    D.DEV_BLOGS,
  "leerob.io":                  D.DEV_BLOGS,

  // Tech News
  "news.ycombinator.com":       D.TECH_NEWS,
  "techcrunch.com":             D.TECH_NEWS,
  "theverge.com":               D.TECH_NEWS,
  "wired.com":                  D.TECH_NEWS,
  "arstechnica.com":            D.TECH_NEWS,
  "thenextweb.com":             D.TECH_NEWS,
  "engadget.com":               D.TECH_NEWS,
  "technologyreview.com":       D.TECH_NEWS,
  "venturebeat.com":            D.TECH_NEWS,
  "zdnet.com":                  D.TECH_NEWS,
  "slashdot.org":               D.TECH_NEWS,
  "infoq.com":                  D.TECH_NEWS,

  // Blogs & Newsletters
  "substack.com":               D.BLOGS,
  "wordpress.com":              D.BLOGS,
  "blogger.com":                D.BLOGS,
  "tumblr.com":                 D.BLOGS,
  "beehiiv.com":                D.BLOGS,
  "buttondown.email":           D.BLOGS,
  "mailchimp.com":              D.BLOGS,
  "convertkit.com":             D.BLOGS,

  // News & Media
  "bbc.com":                    D.NEWS,
  "bbc.co.uk":                  D.NEWS,
  "reuters.com":                D.NEWS,
  "nytimes.com":                D.NEWS,
  "theguardian.com":            D.NEWS,
  "washingtonpost.com":         D.NEWS,
  "cnn.com":                    D.NEWS,
  "apnews.com":                 D.NEWS,
  "npr.org":                    D.NEWS,
  "economist.com":              D.NEWS,
  "ft.com":                     D.NEWS,
  "bloomberg.com":              D.NEWS,
  "theatlantic.com":            D.NEWS,
  "newyorker.com":              D.NEWS,
  "vox.com":                    D.NEWS,

  // eBooks & Literature
  "gutenberg.org":              D.EBOOKS,
  "scribd.com":                 D.EBOOKS,
  "archive.org":                D.EBOOKS,
  "standardebooks.org":         D.EBOOKS,
  "openlibrary.org":            D.EBOOKS,
  "goodreads.com":              D.EBOOKS,
  "libgen.is":                  D.EBOOKS,
  "zlibrary.to":                D.EBOOKS,

  // Research Papers
  "arxiv.org":                  D.RESEARCH,
  "scholar.google.com":         D.RESEARCH,
  "pubmed.ncbi.nlm.nih.gov":    D.RESEARCH,
  "semanticscholar.org":        D.RESEARCH,
  "researchgate.net":           D.RESEARCH,
  "biorxiv.org":                D.RESEARCH,
  "medrxiv.org":                D.RESEARCH,
  "ssrn.com":                   D.RESEARCH,

  // Academic Journals
  "jstor.org":                  D.JOURNALS,
  "ieee.org":                   D.JOURNALS,
  "acm.org":                    D.JOURNALS,
  "nature.com":                 D.JOURNALS,
  "sciencedirect.com":          D.JOURNALS,
  "springer.com":               D.JOURNALS,
  "wiley.com":                  D.JOURNALS,
  "tandfonline.com":            D.JOURNALS,
  "oup.com":                    D.JOURNALS,
  "cell.com":                   D.JOURNALS,
  "science.org":                D.JOURNALS,

  // Social Media
  "twitter.com":                D.SOCIAL_MEDIA,
  "x.com":                      D.SOCIAL_MEDIA,
  "linkedin.com":               D.SOCIAL_MEDIA,
  "facebook.com":               D.SOCIAL_MEDIA,
  "instagram.com":              D.SOCIAL_MEDIA,
  "threads.net":                D.SOCIAL_MEDIA,
  "mastodon.social":            D.SOCIAL_MEDIA,
  "bluesky.app":                D.SOCIAL_MEDIA,
  "bsky.app":                   D.SOCIAL_MEDIA,

  // Forums & Communities
  "reddit.com":                 D.FORUMS,
  "stackoverflow.com":          D.FORUMS,
  "stackexchange.com":          D.FORUMS,
  "lemmy.world":                D.FORUMS,
  "tildes.net":                 D.FORUMS,
  "lobste.rs":                  D.FORUMS,
  "discord.com":                D.FORUMS,
  "quora.com":                  D.FORUMS,
};

// Subdomain suffix → subcategory
const DOMAIN_SUFFIX_MAP = [
  [".readthedocs.io",  D.DOCUMENTATION],
  [".readthedocs.org", D.DOCUMENTATION],
  [".github.io",       D.DEV_BLOGS],
  [".substack.com",    D.BLOGS],
  [".medium.com",      D.DEV_BLOGS],
  [".hashnode.dev",    D.DEV_BLOGS],
  [".beehiiv.com",     D.BLOGS],
];

// URL path keyword → subcategory
const PATH_KEYWORD_MAP = [
  ["/docs/",           D.DOCUMENTATION],
  ["/documentation/",  D.DOCUMENTATION],
  ["/api/",            D.DOCUMENTATION],
  ["/reference/",      D.DOCUMENTATION],
  ["/manual/",         D.DOCUMENTATION],
  ["/tutorial/",       D.TUTORIALS],
  ["/tutorials/",      D.TUTORIALS],
  ["/learn/",          D.TUTORIALS],
  ["/course/",         D.TUTORIALS],
  ["/blog/",           D.DEV_BLOGS],
  ["/post/",           D.BLOGS],
  ["/posts/",          D.BLOGS],
  ["/article/",        D.NEWS],
  ["/articles/",       D.NEWS],
  ["/news/",           D.NEWS],
];

/**
 * Returns { category, subcategory } for a given domain and URL.
 * Checks user overrides first, then domain map, suffix rules, path heuristics.
 */
export async function categorize(domain, url) {
  if (!domain) return { category: CATEGORIES.OTHER, subcategory: SUBCATEGORIES.OTHER };

  // 1. User override (stored as subcategory string)
  const overrides = await storageGet("categoryOverrides", {});
  if (overrides[domain]) {
    const subcategory = overrides[domain];
    const category = SUBCATEGORY_TO_CATEGORY[subcategory] ?? CATEGORIES.OTHER;
    return { category, subcategory };
  }

  // 2. Exact domain match
  if (DOMAIN_MAP[domain]) {
    const subcategory = DOMAIN_MAP[domain];
    return { category: SUBCATEGORY_TO_CATEGORY[subcategory], subcategory };
  }

  // 3. Suffix match
  for (const [suffix, subcategory] of DOMAIN_SUFFIX_MAP) {
    if (domain.endsWith(suffix)) {
      return { category: SUBCATEGORY_TO_CATEGORY[subcategory], subcategory };
    }
  }

  // 4. Path keyword heuristic
  try {
    const { pathname } = new URL(url);
    const path = pathname.toLowerCase();
    for (const [keyword, subcategory] of PATH_KEYWORD_MAP) {
      if (path.includes(keyword)) {
        return { category: SUBCATEGORY_TO_CATEGORY[subcategory], subcategory };
      }
    }
  } catch {
    // Malformed URL — skip path check
  }

  return { category: CATEGORIES.OTHER, subcategory: SUBCATEGORIES.OTHER };
}
