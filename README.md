# Prompt Editor with Basic Version History (Frontend-only)

---

## 🎥 Live Link

[https://markdown-prompt.netlify.app/](https://markdown-prompt.netlify.app/)

---

## Overview

A lightweight React app for editing Markdown text with live preview and basic version history.

- React single-file component (default export, later modularized).
- Local persistence using localStorage.
- Markdown editor with preview.
- Manual snapshots (versions):
  - Rename, preview, restore.
- Max 20 versions (oldest evicted).
- Save quickly with Ctrl/Cmd+S.

## Features

- Live Markdown preview (powered by react-markdown).
- Local persistence (editor state + version history stored in localStorage).
- Version history:
  - Save snapshot manually.
  - Rename snapshots.
  - Restore previous state.
- Cap of 20 versions (FIFO eviction).
- Keyboard shortcut: Ctrl/Cmd+S to save snapshot.

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/adityaindiadev/markdown_prompt_react.git
cd markdown_prompt_react
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. To run tests

```bash
npm run test
```

### 4. Build for production

```bash
npm run build
```

## 📁 Project Structure

```text
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
│   └── vite.svg
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── PromptEditor/
│   │   ├── components/
│   │   │   ├── Editor.jsx
│   │   │   ├── ErrorBanner.jsx
│   │   │   ├── Preview.jsx
│   │   │   ├── VersionPreview.jsx
│   │   │   ├── VersionsSidebar.jsx
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       └── IconButton.jsx
│   │   ├── index.jsx
│   │   └── lib/
│   │       ├── storage.js
│   │       └── utils.js
│   ├── assets/
│   │   └── react.svg
│   ├── index.css
│   └── main.jsx
├── tailwind.config.js
└── vite.config.js
```


##  Decisions

- LocalStorage over IndexedDB: simplicity.
- react-markdown: safe Markdown rendering without direct HTML injection.
- Manual snapshots: avoids excessive auto-saving clutter.
- Persistence: stored under a single localStorage key (prompt-editor-data).

##  State Model

```ts
type Version = {
  id: string;           
  createdAt: string;    
  name?: string;       
  content: string;      
  summary: string;      
};

type DocumentState = {
  id: string;           
  content: string;      
  versions: Version[];  
  updatedAt: string;    
};
```

## Design Decisions & Trade-offs

- Local-only → No sync across devices.
- 20-version cap → Simple eviction but not configurable.
- Markdown rendering only → No WYSIWYG formatting toolbar.

## Accessibility & Performance

- Proper labels for editor (textarea labeled).
- Keyboard shortcut support (Ctrl/Cmd+S).
- Clear button roles for "save / restore / rename".
- LocalStorage writes are lightweight for text sizes < 1MB.
- Capping versions prevents uncontrolled memory growth.