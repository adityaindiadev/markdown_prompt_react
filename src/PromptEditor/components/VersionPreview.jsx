import ReactMarkdown from "react-markdown";
import { fmtTime } from "../lib/utils";

export default function VersionPreview({ selectedVersion, onRestore }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Selected Version</h3>
        <div className="text-xs text-gray-500">{selectedVersion ? fmtTime(selectedVersion.createdAt) : "—"}</div>
      </div>
      <div className="p-4 max-h-72 overflow-auto prose prose-sm">
        {selectedVersion ? (
          <ReactMarkdown>{selectedVersion.content}</ReactMarkdown>
        ) : (
          <p className="text-sm text-gray-600">Choose a version to preview it here.</p>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 p-3 border-t">
        <button
          disabled={!selectedVersion}
          onClick={onRestore}
          className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Restore to Editor
        </button>
      </div>
    </div>
  );
}