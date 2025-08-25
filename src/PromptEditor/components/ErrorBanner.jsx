export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-3">
      <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900 flex items-start justify-between gap-3">
        <div>
          <strong className="font-semibold">Heads up:</strong> {message}
        </div>
        <button
          onClick={onDismiss}
          className="rounded-lg border border-red-200 px-2 py-1 text-red-800 hover:bg-red-100"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
