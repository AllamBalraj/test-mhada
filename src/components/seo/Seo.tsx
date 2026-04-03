import { useEffect } from "react";

type JsonLd = Record<string, unknown>;

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  ogImageUrl?: string;
  noIndex?: boolean;
  jsonLd?: JsonLd[];
};

const DEFAULT_SITE_NAME = "MHADA Lottery";
const DEFAULT_ORIGIN = "https://YOUR_DOMAIN_HERE";

function upsertMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLinkCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(scriptId: string, payload: JsonLd[]) {
  const existing = document.getElementById(scriptId);
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.text = JSON.stringify(payload.length === 1 ? payload[0] : payload);
  document.head.appendChild(script);
}

export default function Seo({
  title,
  description,
  canonicalPath,
  keywords,
  ogImageUrl,
  noIndex,
  jsonLd,
}: SeoProps): null {
  useEffect(() => {
    document.title = title;

    upsertMetaByName("description", description);
    if (keywords?.length) {
      upsertMetaByName("keywords", keywords.join(", "));
    }

    upsertMetaByName(
      "robots",
      noIndex
        ? "noindex,nofollow"
        : "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
    );

    const canonicalUrl = canonicalPath ? `${DEFAULT_ORIGIN}${canonicalPath}` : DEFAULT_ORIGIN;
    upsertLinkCanonical(canonicalUrl);

    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:site_name", DEFAULT_SITE_NAME);
    upsertMetaByProperty("og:title", title);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:url", canonicalUrl);

    const imageUrl = ogImageUrl ?? `${DEFAULT_ORIGIN}/home-page.png`;
    upsertMetaByProperty("og:image", imageUrl);

    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", title);
    upsertMetaByName("twitter:description", description);
    upsertMetaByName("twitter:image", imageUrl);

    if (jsonLd?.length) {
      setJsonLd("seo-jsonld", jsonLd);
    }
  }, [title, description, canonicalPath, keywords, ogImageUrl, noIndex, jsonLd]);

  return null;
}
