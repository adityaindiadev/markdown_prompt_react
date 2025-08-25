import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { DOC_ID, VERSION_CAP, nowISO, truncate, fmtTime } from "./lib/utils";
import { safeLoad, safeSave } from "./lib/storage";

import ErrorBanner from "./components/ErrorBanner";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import VersionsSidebar from "./components/VersionsSidebar";
import VersionPreview from "./components/VersionPreview";
import IconButton from "./components/ui/IconButton";
import Badge from "./components/ui/Badge";

export default function PromptEditor() {
  const didMount = useRef(false);

  const [doc, setDoc] = useState(() => {
    const loaded = safeLoad();
    return loaded || { id: DOC_ID, content: "", versions: [], updatedAt: nowISO() };
  });
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);

  const selectedVersion = useMemo(
    () => doc.versions.find((v) => v.id === selectedVersionId) || null,
    [doc.versions, selectedVersionId]
  );

  // Persist to localStorage after initial mount
  useEffect(() => {
    if (didMount.current) {
      safeSave(doc, () => {
        setError(
          "Storage failed (likely quota). Your latest changes may not persist. Consider copying your text out, clearing some space, or reducing version count."
        );
      });
    } else {
      didMount.current = true;
    }
  }, [doc]);

  // Ctrl/Cmd + S snapshot
  useEffect(() => {
    const handler = (e) => {
      const isSave = (e.key === "s" || e.key === "S") && (e.ctrlKey || e.metaKey);
      if (isSave) { e.preventDefault(); onSaveVersion(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // --- Actions ------------------------------------------------------------
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
      if (nextVersions.length > VERSION_CAP) nextVersions = nextVersions.slice(0, VERSION_CAP);
      return { ...prev, versions: nextVersions, updatedAt: nowISO() };
    });
    setDirty(false);
  }

  function onSelectVersion(id) { setSelectedVersionId(id); }

  function onRestoreSelected() {
    if (!selectedVersion) return;
    setDoc((prev) => ({ ...prev, content: selectedVersion.content, updatedAt: nowISO() }));
    setDirty(true);
  }

  function validateName(name, excludeId = null) {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 40) return "Name must be 1–40 characters.";
    const exists = doc.versions.some(
      (v) => v.id !== excludeId && (v.name || "").toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return "Name must be unique.";
    return null;
  }

  // Called by VersionsSidebar; returns true if rename succeeded
  function onRenameVersion(id, name) {
    const err = validateName(name, id);
    if (err) { setError(err); return false; }
    setDoc((prev) => ({
      ...prev,
      versions: prev.versions.map((v) => (v.id === id ? { ...v, name: name.trim() } : v)),
      updatedAt: nowISO(),
    }));
    return true;
  }

  function onDeleteVersion(id) {
    setDoc((prev) => ({ ...prev, versions: prev.versions.filter((v) => v.id !== id), updatedAt: nowISO() }));
    if (selectedVersionId === id) setSelectedVersionId(null);
  }

  function onClearError() { setError(null); }

  // --- Render -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Prompt Editor</h1>
            {dirty && <Badge>Unsaved changes</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <IconButton title="Save Version (Ctrl/Cmd+S)" onClick={onSaveVersion}>
              <span className="i-mdi-content-save" aria-hidden />💾
              <span>Save Version</span>
              <kbd className="ml-1 rounded border px-1 text-xs">Ctrl/Cmd+S</kbd>
            </IconButton>
          </div>
        </div>
      </header>

      {/* Error banner */}
      <ErrorBanner message={error} onDismiss={onClearError} />

      <main className="mx-auto max-w-7xl px-4 py-4 grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Versions sidebar */}
        <aside className="lg:col-span-3 space-y-3">
          <VersionsSidebar
            versions={doc.versions}
            selectedVersionId={selectedVersionId}
            onSelectVersion={onSelectVersion}
            onDeleteVersion={onDeleteVersion}
            onRenameVersion={onRenameVersion}
          />

          <VersionPreview selectedVersion={selectedVersion} onRestore={onRestoreSelected} />
        </aside>

        {/* Editor + Live Preview */}
        <section className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Editor content={doc.content} onChange={onEditContent} updatedAt={doc.updatedAt} fmtTime={fmtTime} />
            <Preview content={doc.content} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 text-xs text-gray-500">
        <p>Local-only • Data stored in your browser • Version cap {VERSION_CAP} with oldest-first eviction.</p>
      </footer>
    </div>
  );
}