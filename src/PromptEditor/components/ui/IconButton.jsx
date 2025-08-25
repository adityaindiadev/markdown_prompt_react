export default function IconButton({ title, onClick, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm shadow-sm transition active:scale-[.98] disabled:opacity-50 ${
        disabled ? "bg-gray-100" : "bg-white hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
