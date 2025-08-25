import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";


const STORAGE_KEY = "prompt-editor:document-state:v1";
const DOC_ID = "default";
const VERSION_CAP = 20;

function nowISO() {
    return new Date().toISOString();
}
function truncate(str, n = 80) {
    const s = (str || "").replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function fmtTime(iso) {
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(d);
    } catch {
        return iso;
    }
}
function safeLoad() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        return parsed;
    } catch {
        return null;
    }
}
function safeSave(state, onError) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch (e) {
        onError?.(e);
        return false;
    }
}

function Badge({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
            {children}
        </span>
    );
}
function IconButton({ title, onClick, children, disabled }) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm shadow-sm transition active:scale-[.98] disabled:opacity-50 ${disabled ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                }`}
        >
            {children}
        </button>
    );
}

export default function PromptEditor() {

    const didMount = useRef(false);

   const [doc, setDoc] = useState(
        (() => {

            // Load from storage on mount
            const loaded = safeLoad();
            return loaded ? loaded : {
                id: DOC_ID,
                content: "",
                versions: [],
                updatedAt: nowISO(),
            }
        })
    );
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [renameId, setRenameId] = useState(null);
    const [renameDraft, setRenameDraft] = useState("");
    const [error, setError] = useState((null));
    const [dirty, setDirty] = useState(false);

    const selectedVersion = useMemo(
        () => doc.versions.find((v) => v.id === selectedVersionId) || null,
        [doc.versions, selectedVersionId]
    );

    useEffect(() => {
        const loaded = safeLoad();
        if (loaded) {
            setDoc(loaded);
        }
    }, []);


    useEffect(() => {
        if (didMount.current) {
            // Only save AFTER the initial mount
            safeSave(doc, (e) => {
                setError(
                    "Storage failed (likely quota). Your latest changes may not persist. Consider copying your text out, clearing some space, or reducing version count."
                );
            });
        } else {
            didMount.current = true;
        }
    }, [doc]);


useEffect(() => {
    const handler = (e) => {
        const isSave =
            (e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey);
        if (isSave) {
            e.preventDefault();
            onSaveVersion();
        }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
});

function onEditContent(next) {
    setDoc((prev) => ({ ...prev, content: next, updatedAt: nowISO() }));
}

function onSaveVersion() {
    const content = doc.content || "";
    const newVersion = {
        id: uuidv4(),
        createdAt: nowISO(),
        name: undefined,
        content,
        summary: truncate(content, 80),
    };
    setDoc((prev) => {
        let nextVersions = [newVersion, ...prev.versions];
        if (nextVersions.length > VERSION_CAP) {
            nextVersions = nextVersions.slice(0, VERSION_CAP);
        }
        return { ...prev, versions: nextVersions, updatedAt: nowISO() };
    });
    setDirty(false);
}

function onSelectVersion(id) {
    setSelectedVersionId(id);
}

function onRestoreSelected() {
    if (!selectedVersion) return;
    setDoc((prev) => ({
        ...prev,
        content: selectedVersion.content,
        updatedAt: nowISO(),
    }));
    setDirty(true);
}

function onStartRename(v) {
    setRenameId(v.id);
    setRenameDraft(v.name || "");
}
function validateName(name) {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 40)
        return "Name must be 1–40 characters.";
    const exists = doc.versions.some(
        (v) =>
            v.id !== renameId &&
            (v.name || "").toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return "Name must be unique.";
    return null;
}
function onCommitRename() {
    const err = validateName(renameDraft);
    if (err) {
        setError(err);
        return;
    }
    setDoc((prev) => ({
        ...prev,
        versions: prev.versions.map((v) =>
            v.id === renameId ? { ...v, name: renameDraft.trim() } : v
        ),
        updatedAt: nowISO(),
    }));
    setRenameId(null);
    setRenameDraft("");
}
function onCancelRename() {
    setRenameId(null);
    setRenameDraft("");
}

function onDeleteVersion(id) {
    setDoc((prev) => ({
        ...prev,
        versions: prev.versions.filter((v) => v.id !== id),
        updatedAt: nowISO(),
    }));
    if (selectedVersionId === id) setSelectedVersionId(null);
}

function onClearError() {
    setError(null);
}

return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Prompt Editor
                    </h1>
                    {dirty && <Badge>Unsaved changes</Badge>}
                </div>
                <div className="flex items-center gap-2">
                    <IconButton
                        title="Save Version (Ctrl/Cmd+S)"
                        onClick={onSaveVersion}
                    >
                        <span className="i-mdi-content-save" aria-hidden />
                        💾
                        <span>Save Version</span>
                        <kbd className="ml-1 rounded border px-1 text-xs">Ctrl/Cmd+S</kbd>
                    </IconButton>
                </div>
            </div>
        </header>

        {/* Error  */}
        {error && (
            <div className="mx-auto max-w-7xl px-4 pt-3">
                <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-900 flex items-start justify-between gap-3">
                    <div>
                        <strong className="font-semibold">Heads up:</strong> {error}
                    </div>
                    <button
                        onClick={onClearError}
                        className="rounded-lg border border-red-200 px-2 py-1 text-red-800 hover:bg-red-100"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        )}

        <main className="mx-auto max-w-7xl px-4 py-4 grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/*  sidebar */}
            <aside className="lg:col-span-3 space-y-3">
                <div className="rounded-2xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-600">
                            Versions
                        </h2>
                        <span className="text-xs text-gray-500">
                            {doc.versions.length}/{VERSION_CAP}
                        </span>
                    </div>
                    {doc.versions.length === 0 ? (
                        <div className="p-4 text-sm text-gray-600">
                            <p className="mb-2">No versions yet.</p>
                            <p>
                                Create your first snapshot with{" "}
                                <span className="font-medium">Save Version</span> or press{" "}
                                <kbd className="rounded border px-1">Ctrl/Cmd+S</kbd>.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {doc.versions.map((v) => (
                                <li
                                    key={v.id}
                                    className={`px-4 py-3 hover:bg-gray-50 ${selectedVersionId === v.id ? "bg-gray-50" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <button
                                            onClick={() => onSelectVersion(v.id)}
                                            className="flex-1 text-left bg-white"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate max-w-[12rem]">
                                                    {v.name || "(unnamed)"}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {fmtTime(v.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                                {v.summary || "(empty)"}
                                            </p>
                                        </button>
                                        <div className="flex flex-col items-end gap-1">
                                            {renameId === v.id ? (
                                                <div className="flex items-center gap-1 ">
                                                    <input
                                                        autoFocus
                                                        value={renameDraft}
                                                        onChange={(e) => setRenameDraft(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") onCommitRename();
                                                            if (e.key === "Escape") onCancelRename();
                                                        }}
                                                        className="w-32 rounded-lg border px-2 py-1 text-sm bg-white"
                                                        placeholder="Version name"
                                                        maxLength={40}
                                                    />
                                                    <button
                                                        onClick={onCommitRename}
                                                        className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={onCancelRename}
                                                        className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        title="Rename"
                                                        onClick={() => onStartRename(v)}
                                                        className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50"
                                                    >
                                                        Rename
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        onClick={() => onDeleteVersion(v.id)}
                                                        className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setSelectedVersionId(v.id)}
                                                className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50"
                                            >
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Selected version */}
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="text-sm font-semibold">Selected Version</h3>
                        <div className="text-xs text-gray-500">
                            {selectedVersion ? fmtTime(selectedVersion.createdAt) : "—"}
                        </div>
                    </div>
                    <div className="p-4 max-h-72 overflow-auto prose prose-sm">
                        {selectedVersion ? (
                            <ReactMarkdown>{selectedVersion.content}</ReactMarkdown>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Choose a version to preview it here.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2 p-3 border-t">
                        <button
                            disabled={!selectedVersion}
                            onClick={onRestoreSelected}
                            className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Restore to Editor
                        </button>
                    </div>
                </div>
            </aside>

            {/*  Preview */}
            <section className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-white shadow-sm flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h2 className="text-sm font-semibold">Editor (Markdown)</h2>
                            <div className="text-xs text-gray-500">
                                Updated {fmtTime(doc.updatedAt)}
                            </div>
                        </div>
                        <textarea
                            value={doc.content}
                            onChange={(e) => onEditContent(e.target.value)}
                            placeholder="# Your prompt...\n\nType Markdown here. Use **bold**, _italic_, lists, code blocks, and links."
                            className="min-h-[24rem] grow resize-y p-4 outline-none rounded-b-2xl bg-white"
                        />
                    </div>
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Live Preview</h2>
                            <Badge>Read-only</Badge>
                        </div>
                        <div className="p-4 prose max-w-none overflow-auto min-h-[24rem]">
                            <ReactMarkdown>
                                {doc.content || "*(Nothing to preview yet.)*"}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        
    </div>
);
}
