import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRouteSeo, SITE_URL } from "./routes";

function setMeta(
  key: string,
  content: string,
  attribute: "name" | "property" = "name",
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let element =
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function setJsonLd(jsonLd?: Record<string, unknown>) {
  const ID = "route-jsonld";
  let script = document.getElementById(ID) as HTMLScriptElement | null;

  if (!jsonLd) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(jsonLd);
}

/**
 * Mantiene el título, la descripción, el canonical, las etiquetas sociales
 * y los datos estructurados sincronizados con la ruta actual.
 */
export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getRouteSeo(pathname);
    const canonicalPath = seo.path === "/" ? "/" : seo.path;
    const url = `${SITE_URL}${canonicalPath}`;
    const image = `${SITE_URL}/og-image.png`;

    document.title = seo.title;

    setMeta("description", seo.description);
    setMeta("robots", seo.robots);

    setCanonical(url);

    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");
    setMeta("og:url", url, "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:alt", seo.title, "property");

    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", image);

    setJsonLd(seo.jsonLd);
  }, [pathname]);

  return null;
}
