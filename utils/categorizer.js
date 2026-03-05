// utils/categorizer.js
// Maps a domain to one of ReadTrack's site categories.
// Priority order: user override → exact domain match → subdomain match → path/keyword heuristic → "Other"

import { storageGet } from "./storage.js";

export const CATEGORIES = {
  DOCUMENTATION: "Documentation",
  BLOGS: "Blogs",
  NEWS: "News",
  SOCIAL: "Social Media",
  RESEARCH: "Research",
  EBOOKS: "eBooks",
  OTHER: "Other",
};

// Exact or suffix-matched domain → category
const DOMAIN_MAP = {
  // Documentation
  "developer.mozilla.org": CATEGORIES.DOCUMENTATION,
  "devdocs.io": CATEGORIES.DOCUMENTATION,
  "readthedocs.io": CATEGORIES.DOCUMENTATION,
  "readthedocs.org": CATEGORIES.DOCUMENTATION,
  "docs.python.org": CATEGORIES.DOCUMENTATION,
  "docs.djangoproject.com": CATEGORIES.DOCUMENTATION,
  "docs.github.com": CATEGORIES.DOCUMENTATION,
  "docs.docker.com": CATEGORIES.DOCUMENTATION,
  "docs.aws.amazon.com": CATEGORIES.DOCUMENTATION,
  "cloud.google.com": CATEGORIES.DOCUMENTATION,
  "learn.microsoft.com": CATEGORIES.DOCUMENTATION,
  "developer.apple.com": CATEGORIES.DOCUMENTATION,
  "developer.android.com": CATEGORIES.DOCUMENTATION,
  "reactjs.org": CATEGORIES.DOCUMENTATION,
  "react.dev": CATEGORIES.DOCUMENTATION,
  "vuejs.org": CATEGORIES.DOCUMENTATION,
  "angular.io": CATEGORIES.DOCUMENTATION,
  "nodejs.org": CATEGORIES.DOCUMENTATION,
  "kotlinlang.org": CATEGORIES.DOCUMENTATION,
  "docs.rs": CATEGORIES.DOCUMENTATION,
  "pkg.go.dev": CATEGORIES.DOCUMENTATION,
  "cppreference.com": CATEGORIES.DOCUMENTATION,
  "ruby-doc.org": CATEGORIES.DOCUMENTATION,

  // Blogs
  "medium.com": CATEGORIES.BLOGS,
  "substack.com": CATEGORIES.BLOGS,
  "dev.to": CATEGORIES.BLOGS,
  "hashnode.com": CATEGORIES.BLOGS,
  "ghost.io": CATEGORIES.BLOGS,
  "wordpress.com": CATEGORIES.BLOGS,
  "blogger.com": CATEGORIES.BLOGS,
  "tumblr.com": CATEGORIES.BLOGS,
  "beehiiv.com": CATEGORIES.BLOGS,

  // News
  "news.ycombinator.com": CATEGORIES.NEWS,
  "techcrunch.com": CATEGORIES.NEWS,
  "theverge.com": CATEGORIES.NEWS,
  "wired.com": CATEGORIES.NEWS,
  "arstechnica.com": CATEGORIES.NEWS,
  "bbc.com": CATEGORIES.NEWS,
  "bbc.co.uk": CATEGORIES.NEWS,
  "reuters.com": CATEGORIES.NEWS,
  "nytimes.com": CATEGORIES.NEWS,
  "theguardian.com": CATEGORIES.NEWS,
  "washingtonpost.com": CATEGORIES.NEWS,
  "cnn.com": CATEGORIES.NEWS,
  "thenextweb.com": CATEGORIES.NEWS,
  "engadget.com": CATEGORIES.NEWS,

  // Social Media
  "twitter.com": CATEGORIES.SOCIAL,
  "x.com": CATEGORIES.SOCIAL,
  "reddit.com": CATEGORIES.SOCIAL,
  "linkedin.com": CATEGORIES.SOCIAL,
  "facebook.com": CATEGORIES.SOCIAL,
  "instagram.com": CATEGORIES.SOCIAL,
  "threads.net": CATEGORIES.SOCIAL,
  "mastodon.social": CATEGORIES.SOCIAL,
  "lemmy.world": CATEGORIES.SOCIAL,
  "news.ycombinator.com": CATEGORIES.NEWS,

  // Research
  "arxiv.org": CATEGORIES.RESEARCH,
  "scholar.google.com": CATEGORIES.RESEARCH,
  "pubmed.ncbi.nlm.nih.gov": CATEGORIES.RESEARCH,
  "semanticscholar.org": CATEGORIES.RESEARCH,
  "researchgate.net": CATEGORIES.RESEARCH,
  "jstor.org": CATEGORIES.RESEARCH,
  "ieee.org": CATEGORIES.RESEARCH,
  "acm.org": CATEGORIES.RESEARCH,
  "nature.com": CATEGORIES.RESEARCH,
  "sciencedirect.com": CATEGORIES.RESEARCH,
  "springer.com": CATEGORIES.RESEARCH,

  // eBooks
  "gutenberg.org": CATEGORIES.EBOOKS,
  "scribd.com": CATEGORIES.EBOOKS,
  "archive.org": CATEGORIES.EBOOKS,
  "standardebooks.org": CATEGORIES.EBOOKS,
  "openlibrary.org": CATEGORIES.EBOOKS,
};

// If domain ends with any of these suffixes, assign the mapped category
const DOMAIN_SUFFIX_MAP = [
  [".readthedocs.io", CATEGORIES.DOCUMENTATION],
  [".readthedocs.org", CATEGORIES.DOCUMENTATION],
  [".github.io", CATEGORIES.BLOGS],
  [".substack.com", CATEGORIES.BLOGS],
  [".medium.com", CATEGORIES.BLOGS],
  [".hashnode.dev", CATEGORIES.BLOGS],
];

// If the URL path contains any of these segments, use the mapped category
const PATH_KEYWORD_MAP = [
  ["/docs/", CATEGORIES.DOCUMENTATION],
  ["/documentation/", CATEGORIES.DOCUMENTATION],
  ["/api/", CATEGORIES.DOCUMENTATION],
  ["/reference/", CATEGORIES.DOCUMENTATION],
  ["/manual/", CATEGORIES.DOCUMENTATION],
  ["/blog/", CATEGORIES.BLOGS],
  ["/post/", CATEGORIES.BLOGS],
  ["/posts/", CATEGORIES.BLOGS],
  ["/article/", CATEGORIES.BLOGS],
  ["/articles/", CATEGORIES.BLOGS],
  ["/news/", CATEGORIES.NEWS],
];

/**
 * Returns the category for a given domain and URL path.
 * Checks user overrides first, then the domain map, then suffix rules, then path heuristics.
 */
export async function categorize(domain, url) {
  if (!domain) return CATEGORIES.OTHER;

  // 1. User override
  const overrides = await storageGet("categoryOverrides", {});
  if (overrides[domain]) return overrides[domain];

  // 2. Exact domain match
  if (DOMAIN_MAP[domain]) return DOMAIN_MAP[domain];

  // 3. Suffix match (e.g. myblog.substack.com)
  for (const [suffix, category] of DOMAIN_SUFFIX_MAP) {
    if (domain.endsWith(suffix)) return category;
  }

  // 4. Path keyword heuristic
  try {
    const { pathname } = new URL(url);
    const path = pathname.toLowerCase();
    for (const [keyword, category] of PATH_KEYWORD_MAP) {
      if (path.includes(keyword)) return category;
    }
  } catch {
    // Malformed URL — skip path check
  }

  return CATEGORIES.OTHER;
}
