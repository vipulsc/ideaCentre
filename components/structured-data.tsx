import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * JSON-LD structured data for rich results in search.
 *
 * - Organization: brand entity (name, logo, contact) for the Knowledge Graph.
 * - WebSite: enables the Google Sitelinks Search Box.
 * - SoftwareApplication: describes ideaCentre as a free web app.
 *
 * Server-rendered so crawlers see it in the initial HTML.
 */
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.svg"),
        },
        description: siteConfig.description,
        email: siteConfig.email,
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: absoluteUrl("/reel?idea={search_term_string}"),
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": absoluteUrl("/#app"),
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: siteConfig.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": absoluteUrl("/#organization") },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD is trusted, static content generated on the server.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
