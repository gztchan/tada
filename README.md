# Tada

A lightweight, multi-window **sticky** note-taking app for the desktop(macOS). Built with Electron and React.

## Features

- **Sticky notes** — Each note opens in its own compact, always-on-top window with movable and resizable switchers
- **Rich text editing** — Editor with Markdown support and task lists
- **Local-first** — Notes stored in SQLite on your machine; no cloud required

## Tech Stack

| Layer        | Stack                                                |
| ------------ | ---------------------------------------------------- |
| Desktop      | Electron                                             |
| Frontend     | React 19, TypeScript, Tailwind CSS                   |
| Editor       | TipTap (Markdown, task lists)                        |
| UI           | Radix UI, Lucide / Phosphor / HugeIcons              |
| Database     | SQLite (better-sqlite3), Prisma migrations           |
| Validation   | Zod                                                  |
| State        | Valtio                                               |
| Build        | Vite, pnpm workspaces, Turbo                         |

## Project Structure

Monorepo managed with pnpm workspaces:

```
tada/
├── packages/
│   ├── api/          # Database API layer (Zod, SQLite client)
│   ├── database/     # Prisma schema and migrations
│   ├── editor/       # TipTap rich text editor component
│   ├── interfaces/   # Shared TypeScript types
│   └── ui/           # Shared UI components (Radix, Tailwind)
├── tada/             # Main Electron app
│   ├── src/
│   │   ├── electron/ # Main process, services, IPC
│   │   └── app/      # React pages (dashboard, note, about)
│   └── templates/    # HTML entry points per window type
├── assets/           # App and tray icons
└── package.json
```

The app uses a **multi-window** layout: note windows, dashboard, and utility windows (About, etc.) each have their own HTML template and React entry point. The main process uses a **Context**-based dependency injection pattern and services (tray, note windows, note manager) that communicate over IPC with a unified, Zod-validated API.

## Prerequisites

- **Node.js** 18+
- **pnpm** 10+ (`npm install -g pnpm`)

## Installation

```bash
git clone https://github.com/your-username/tada.git
cd tada
pnpm install
```

## Development

From the repository root:

```bash
# Start Vite dev server and Electron
pnpm dev
```

Or run pieces separately:

```bash
pnpm dev:react    # Vite dev server (default port 3524)
pnpm dev:electron # Electron main process
```

Notes and dashboard hot-reload. The app uses `PORT=3524` in development so Electron loads the React app from the dev server.

## Build

```bash
# Clean, build frontend, transpile Electron
pnpm clean
pnpm transpile:electron
pnpm build
```

## Package for distribution

Uses [Electron Forge](https://www.electronforge.io/). From the repo root:

```bash
pnpm package
```

This runs clean → build → transpile → Forge package and make. On macOS you can build:

- **Universal** (ARM64 + x64): default `make` target
- **ARM64 only**: configure in `forge.config.js` / Forge makers
- **x64 only**: same via Forge config

Outputs go to the `out/` directory (or as configured in Forge).

## Environment

| Variable | Description |
| -------- | ----------- |
| `PORT`   | Dev server port (default `3524`). Used by Electron to load the React app in development. |

## Database

- SQLite database path: `app.getPath('userData')/tada.db`
- Migrations: Prisma in `packages/database/migrations/`
- All access goes through `@tada/api` with Zod-validated inputs and outputs

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes, and ensure tests and lint pass before submitting a pull request.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE.txt) for details.
