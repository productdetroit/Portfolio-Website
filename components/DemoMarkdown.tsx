import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders a demo's markdown body. react-markdown builds elements rather
 *  than injecting HTML, so raw tags in the source are shown, not executed.
 *  Links open in a new tab — the demo page is the viewer's home base while
 *  they poke at the live app. */
export default function DemoMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="dm-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
