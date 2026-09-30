import Link from "next/link";
import type { Product } from "@/content/products";
import { shortDuration } from "@/lib/buildlog/format";
import type { ProductBuildLog } from "@/lib/buildlog/types";

/** One product on the /building portfolio index. The whole surface is the
 *  link to /building/[slug] — no nested interactive elements, no client JS.
 *
 *  Stats come live off the product's register, except the test count, which
 *  no provider reports yet and is authored in content/products.tsx. */
export default function ProductCard({
  product,
  log,
}: {
  product: Product;
  log?: ProductBuildLog;
}) {
  /* Scoreboard's rule, §6.3: never render a zero. A missing register or a
     zeroed metric drops the stat and the row reflows. */
  const stats: Array<{ label: string; value: string }> = [
    log && log.featuresLive > 0
      ? { label: "Work items", value: String(log.featuresLive) }
      : null,
    log && log.specToShipped.value > 0
      ? { label: "Spec → shipped", value: shortDuration(log.specToShipped) }
      : null,
    product.tests
      ? { label: "Tests", value: product.tests.toLocaleString("en-US") }
      : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  return (
    <Link className="bl-card" href={`/building/${product.slug}`}>
      <div className="bl-card-shot">
        <img
          src={product.card.img}
          alt={product.card.alt}
          width={product.card.width}
          height={product.card.height}
          loading="lazy"
          style={{ objectPosition: product.card.objectPosition }}
        />
      </div>
      <div className="bl-card-body">
        <div className="bl-card-top">
          <span className="bl-card-index">{product.index}</span>
          <span className="bl-card-status">{product.status}</span>
        </div>
        <h3 className="bl-card-title">
          {product.name} &mdash; {product.thesis}
        </h3>
        <p className="bl-card-meta">
          {product.domain} · {product.audience}
        </p>
        <p className="bl-card-summary">{product.summary}</p>
        {stats.length > 0 ? (
          <dl className="bl-card-stats">
            {stats.map((s) => (
              <div key={s.label} className="bl-card-stat">
                <dt className="bl-card-label">{s.label}</dt>
                <dd className="bl-card-value">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="bl-card-cta">
          Read the build <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
