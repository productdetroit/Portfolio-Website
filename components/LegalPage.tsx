type LegalDoc = {
  title: string;
  updated: string;
  isPlaceholder?: boolean;
  body: readonly string[];
};

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <section style={{ paddingTop: 140 }}>
      <div className="section-inner legal">
        <div className="section-label">Legal</div>
        <h2>{doc.title}</h2>
        <p className="legal-updated">Last updated: {doc.updated}</p>
        {doc.isPlaceholder && (
          <p className="legal-warning">
            This page is a placeholder and must be replaced with the live policy
            text before this site is served on productdetroit.com.
          </p>
        )}
        {doc.body.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
      </div>
    </section>
  );
}
