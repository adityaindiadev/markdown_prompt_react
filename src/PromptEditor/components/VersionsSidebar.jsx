import { useState } from "react";
import { VERSION_CAP, fmtTime } from "../lib/utils";

export default function VersionsSidebar({
    versions,
    selectedVersionId,
    onSelectVersion,
    onDeleteVersion,
    onRenameVersion, // (id, name) => boolean (true if success, false if validation failed)
}) {
    const [renameId, setRenameId] = useState(null);
    const [renameDraft, setRenameDraft] = useState("");

    function startRename(v) {
        setRenameId(v.id);
        setRenameDraft(v.name || "");
    }
    function commitRename() {
        if (!renameId) return;
        const ok = onRenameVersion(renameId, renameDraft.trim());
        if (ok) {
            setRenameId(null);
            setRenameDraft("");
        }
    }
    function cancelRename() {
        setRenameId(null);
        setRenameDraft("");
    }

    return (
        <div className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-600">Versions</h2>
                <span className="text-xs text-gray-500">{versions.length}/{VERSION_CAP}</span>
            </div>

            {versions.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">
                    <p className="mb-2">No versions yet.</p>
                    <p>
                        Create your first snapshot with <span className="font-medium">Save Version</span> or press
                        <kbd className="mx-1 rounded border px-1">Ctrl/Cmd+S</kbd>.
                    </p>
                </div>
            ) : (
                <ul className="divide-y">
                    {versions.map((v) => (
                        <li key={v.id} className={`px-4 py-3 hover:bg-gray-50 ${selectedVersionId === v.id ? "bg-gray-50" : ""}`}>
                            <div className="flex items-start gap-2">
                                <button onClick={() => onSelectVersion(v.id)} className="flex-1 text-left bg-white">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate max-w-[12rem]">{v.name || "(unnamed)"}</span>
                                        <span className="text-[10px] text-gray-500">{fmtTime(v.createdAt)}</span>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{v.summary || "(empty)"}</p>
                                </button>
                                <div className="flex flex-col items-end gap-1">
                                    {renameId === v.id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                autoFocus
                                                value={renameDraft}
                                                onChange={(e) => setRenameDraft(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") cancelRename(); }}
                                                className="w-32 rounded-lg border px-2 py-1 text-sm bg-white"
                                                placeholder="Version name"
                                                maxLength={40}
                                            />
                                            <button onClick={commitRename} className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50">Save</button>
                                            <button onClick={cancelRename} className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button title="Rename" onClick={() => startRename(v)} className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50">Rename</button>
                                            <button title="Delete" onClick={() => onDeleteVersion(v.id)} className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50">Delete</button>
                                        </div>
                                    )}
                                    <button onClick={() => onSelectVersion(v.id)} className="rounded-md border px-2 py-1 text-xs bg-white hover:bg-gray-50">Preview</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}