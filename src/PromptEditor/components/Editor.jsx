export default function Editor({ content, onChange, updatedAt, fmtTime }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-sm font-semibold">Editor (Markdown)</h2>
        <div className="text-xs text-gray-500">Updated {fmtTime(updatedAt)}</div>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# Your prompt...\n\nType Markdown here. Use **bold**, _italic_, lists, code blocks, and links."
        className="min-h-[24rem] grow resize-y p-4 outline-none rounded-b-2xl bg-white"
      />
    </div>
  );
}
