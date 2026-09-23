import ReactMarkdown from "react-markdown";

/**
 * Render isi berita (Markdown). HTML mentah tidak dirender (bawaan
 * react-markdown) dan gambar di dalam isi sengaja dinonaktifkan: satu-satunya
 * foto berita adalah foto sampul.
 */
export function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-base leading-8 text-slate-700">
      <ReactMarkdown
        disallowedElements={["img"]}
        components={{
          h1: (props) => (
            <h2 className="pt-4 text-3xl font-semibold text-slate-950" {...props} />
          ),
          h2: (props) => (
            <h2 className="pt-4 text-2xl font-semibold text-slate-950" {...props} />
          ),
          h3: (props) => (
            <h3 className="pt-2 text-xl font-semibold text-slate-950" {...props} />
          ),
          a: (props) => (
            <a
              className="font-medium text-rose-600 underline underline-offset-2 hover:text-rose-700"
              target="_blank"
              rel="noopener noreferrer nofollow"
              {...props}
            />
          ),
          ul: (props) => <ul className="list-disc space-y-1 pl-6" {...props} />,
          ol: (props) => <ol className="list-decimal space-y-1 pl-6" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-rose-200 pl-4 italic text-slate-600"
              {...props}
            />
          ),
          code: (props) => (
            <code
              className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800"
              {...props}
            />
          ),
          pre: (props) => (
            <pre
              className="overflow-x-auto rounded-xl bg-slate-100 p-4 text-sm"
              {...props}
            />
          ),
          hr: () => <hr className="border-slate-200" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
