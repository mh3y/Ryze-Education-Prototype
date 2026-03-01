type SeoConfig = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
};

const upsertMeta = (selector: string, create: () => HTMLElement, apply: (element: HTMLElement) => void) => {
  let element = document.querySelector(selector) as HTMLElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  apply(element);
};

export const applySeo = (config: SeoConfig) => {
  if (typeof window === 'undefined') return;

  const canonicalUrl = `${window.location.origin}${config.path}`;
  const ogTitle = config.ogTitle || config.title;
  const ogDescription = config.ogDescription || config.description;
  const ogImage =
    config.ogImage ||
    'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_1200,h_630,c_fill,g_auto/v1764105292/yellow_logo_png_bvs11z.png';

  document.title = config.title;

  upsertMeta(
    'meta[name="description"]',
    () => {
      const tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      return tag;
    },
    (element) => {
      element.setAttribute('content', config.description);
    },
  );

  upsertMeta(
    'link[rel="canonical"]',
    () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    },
    (element) => {
      element.setAttribute('href', canonicalUrl);
    },
  );

  const socialTags: Array<{ property: string; content: string }> = [
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: ogImage },
    { property: 'twitter:title', content: ogTitle },
    { property: 'twitter:description', content: ogDescription },
    { property: 'twitter:url', content: canonicalUrl },
    { property: 'twitter:image', content: ogImage },
  ];

  for (const tag of socialTags) {
    const selector = tag.property.startsWith('og:')
      ? `meta[property="${tag.property}"]`
      : `meta[property="${tag.property}"], meta[name="${tag.property}"]`;

    upsertMeta(
      selector,
      () => {
        const meta = document.createElement('meta');
        if (tag.property.startsWith('og:')) meta.setAttribute('property', tag.property);
        else meta.setAttribute('name', tag.property);
        return meta;
      },
      (element) => {
        element.setAttribute('content', tag.content);
      },
    );
  }

  if (config.jsonLd) {
    upsertMeta(
      'script[data-seo-jsonld="page"]',
      () => {
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo-jsonld', 'page');
        return script;
      },
      (element) => {
        element.textContent = JSON.stringify(config.jsonLd);
      },
    );
  }
};
