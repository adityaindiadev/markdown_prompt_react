import ReactMarkdown from "react-markdown";
import Badge from "./ui/Badge";

export default function Preview({ content }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold">Live Preview</h2>
        <Badge>Read-only</Badge>
      </div>
      <div className="p-4 prose max-w-none overflow-auto min-h-[24rem]">
        <ReactMarkdown>
          {content || "*(Nothing to preview yet.)*"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
