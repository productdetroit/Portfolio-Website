import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactBand from "@/components/ContactBand";
import Scoreboard from "@/components/Scoreboard";
import { PRODUCTS, nextProduct, productBySlug } from "@/content/products";
import { site } from "@/content/site";
import { getBuildLog } from "@/lib/buildlog";

export const revalidate = 3600;

/** One page per product: the story, the screenshot, every technical
 *  highlight, and the product's own register. /building keeps the claim and
 *  the operating model; this is where the detail behind one card lives. */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/** Explicit per-route OG/Twitter tags — without these the root layout's
 *  homepage values leak through (update-spec §5.1). The short `title` picks
 *  up the layout's suffix template; OG and Twitter don't, so they spell the
 *  full string out. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};

  /* Product name only: the layout's template makes that
     "TopHand — Joe Ross, Product Detroit", which is what OG and Twitter
     spell out below. "— Building" in between was a third dash for nothing. */
  const fullTitle = `${product.name} — Joe Ross, Product Detroit`;
  /* A file-based opengraph-image.png doesn't cascade into a nested segment,
     so /building's card is named explicitly here — without it these pages
     share with no image at all. */
  const image = `${site.url}/building/opengraph-image.png`;
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: fullTitle,
      description: product.description,
      url: `${site.url}/building/${product.slug}`,
      siteName: site.name,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: product.description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const log = await getBuildLog();
  const register = log.products.find((p) => p.productId === product.productId);
  const next = nextProduct(product);

  return (
    <div className="building">
      <article className="bl-detail">
        <Link className="bl-back" href="/building">
          <span aria-hidden="true">←</span> All products
        </Link>

        {product.logo ? (
          <div className="bl-product-logo">{product.logo}</div>
        ) : null}
        <div className="section-label">{product.index}</div>
        <h1 className="bl-detail-h1">
          {product.name} &mdash; {product.thesis}
        </h1>
        <p className="bl-tophand-meta bl-detail-meta">{product.meta}</p>

        <div
          className={`bl-detail-story${product.figureFullWidth ? " full-figure" : ""}`}
        >
          <div className="bl-prose">
            {product.story}
            <a
              className="bl-tophand-cta"
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {product.ctaLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
          {product.figure}
        </div>

        {/* Expanded, not a <details>: on /building the dense engineering list
            was one click away so the narrative stayed on the surface. This
            page IS the detail — collapsing it here would hide the point. */}
        <section
          className="bl-highlights bl-detail-highlights"
          aria-labelledby="hl-h"
        >
          <div className="section-label" id="hl-h">
            Technical highlights
          </div>
          <ul>
            {product.highlights.map(([name, detail]) => (
              <li key={name}>
                <strong>{name}</strong> {detail}
              </li>
            ))}
          </ul>
        </section>

        {register ? (
          <section className="bl-detail-register" aria-label="The receipts">
            <Scoreboard log={register} />
          </section>
        ) : null}

        <nav className="bl-pager" aria-label="Portfolio">
          <Link href="/building">
            <span aria-hidden="true">←</span> All products
          </Link>
          {next ? (
            <Link href={`/building/${next.slug}`}>
              Next: {next.name} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <ContactBand />
    </div>
  );
}
