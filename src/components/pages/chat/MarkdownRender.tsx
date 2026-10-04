import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    // Wrap in a div to apply the tailwind 'prose' styles 
    // This avoids the 'className' error on the ReactMarkdown component itself
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Use destructured props to avoid 'node' unused warnings
          ul: ({ ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          // For inline code
          code: ({ ...props }) => (
            <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs" {...props} />
          ),
          // Ensure links open in new tabs
          a: ({ ...props }) => <a className="text-primary underline" target="_blank" rel="noopener noreferrer" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}