# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an Electron-based note-taking application using React + TypeScript with a monorepo structure managed by pnpm workspaces.

### Key Architecture

- **Monorepo**: Uses pnpm workspaces with packages in `packages/*` and main app in `tada/`
- **Main App** (`tada/`): Multi-window Electron application with React frontend
  - Electron main process: `tada/src/electron/main.ts`
  - Multiple window types: Note windows, Dashboard, Settings, About
  - Uses Vite for bundling with React plugin
  - Multi-page build system with separate HTML templates in `tada/templates/`
- **Packages**:
  - `@tada/editor`: TipTap-based rich text editor component
  - `@tada/ui`: Shared UI components with Tailwind CSS and Radix UI
  - `@tada/api`: Database API layer with Zod validation
  - `@tada/interfaces`: TypeScript interfaces and types

### Service Architecture

The Electron main process uses a dependency injection pattern with a `Context` class:
- Services are registered in `tada/src/electron/main.ts` and stored in `Context`
- Available services: `tray`, `window` (NoteWindowService), `note` (NoteManagerService), `about`
- Services use `ts-mixer` for mixins and inherit from `ContextService` and `EventBusService`
- Services communicate via IPC through a unified API handler using Zod schemas

### Multi-Window System

The app uses a multi-window architecture where different features run in separate windows:
- **Note windows**: Individual note instances with frameless, always-on-top windows (300x600px default)
- **Dashboard**: Main app window for note management
- **Settings/About**: Separate utility windows
- Each window type has its own HTML template and React entry point in `tada/src/app/pages/`
- Windows are managed by `NoteWindowService` which tracks window-to-note ID mappings

### Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Editor**: TipTap with Markdown support and task lists
- **UI Components**: Radix UI primitives, Lucide icons, Phosphor icons, HugeIcons
- **Desktop**: Electron with custom frameless windows
- **Database**: SQLite with better-sqlite3
- **State Management**: Valtio for React state
- **Validation**: Zod for runtime type validation (used extensively in API layer)
- **Build**: Vite + Turbo for monorepo orchestration
- **Package Manager**: pnpm

## Development Commands

### Root Level Commands
```bash
# Start development (runs React dev server + Electron)
pnpm dev

# Build entire application (typecheck + electron-vite build)
pnpm build

# Start Electron preview
pnpm start
```

### Within tada/ directory
```bash
# Development (runs React and Electron in parallel)
pnpm dev

# Individual services
pnpm dev:react    # Start Vite dev server
pnpm dev:electron # Start Electron process

# Build
pnpm build        # TypeScript compile + Vite build
pnpm transpile:electron # Compile Electron TypeScript only
pnpm clean        # Remove dist directory

# Distribution (macOS)
pnpm dist:mac        # Build for macOS Universal (ARM64 + x64)
pnpm dist:mac:arm64  # Build for macOS ARM64 only
pnpm dist:mac:x64    # Build for macOS x64 only
```

### Package Development
```bash
# Within any package directory
pnpm dev          # Start development (varies by package)
pnpm build        # TypeScript compilation
```

## Key Files and Architecture Patterns

### Multi-Page Build System
The Vite configuration (`tada/vite.config.ts`) is set up for multi-page builds with separate entry points:
- `templates/note.html` → Individual note windows
- `templates/dashboard.html` → Main dashboard
- `templates/setting.html` → Settings window
- `templates/about.html` → About window

Each template loads its own React entry point from `tada/src/app/pages/[page]/page.tsx`

### API Communication Pattern
The app uses a unified IPC communication pattern:
1. Renderer processes invoke APIs via `window.api.invoke("api", functionName, params)`
2. Main process routes to `collection[functionName]` in `packages/api/src/index.ts`
3. API functions use Zod schemas for input/output validation
4. All API functions in `packages/api/src/note.ts` extend the `Template` base class and use `withContext` helper

### Service Pattern
Services in `tada/src/electron/services/`:
- Extend `ContextService` for dependency injection access
- Mix in `EventBusService` for event emission
- Use Zod for runtime validation of public methods
- Are registered with the `Context` singleton in `main.ts`

### Key Files
- `tada/src/electron/main.ts`: App entry point, service registration, IPC handler setup
- `tada/src/electron/context.ts`: Dependency injection container
- `tada/src/electron/services/note-window.ts`: Window lifecycle and note-to-window mapping
- `packages/api/src/note.ts`: Database operations with Zod schemas
- `tada/vite.config.ts`: Multi-page build configuration
- `turbo.json`: Monorepo task orchestration

## Environment Variables

- `PORT`: Development server port (default: 5173). Required in development mode for Electron to load the React app.

## Build System

The project uses a multi-stage build process:
1. TypeScript compilation for type checking (`tsc -b`)
2. Vite builds React frontend to `dist/react/` with multiple entry points
3. Electron TypeScript compilation to `dist/electron/`
4. Final electron-vite bundling creates distributable

For distribution builds, the process is:
1. `pnpm clean` - Remove dist directory
2. `pnpm transpile:electron` - Compile Electron TypeScript
3. `pnpm build` - Build React frontend
4. `electron-builder` - Package the application

The build output includes:
- `dist/electron/` - Compiled Electron main process
- `dist/react/` - Built React frontend assets
- Packaged in `dist/` directory by electron-builder

## Development Notes

### Window Management
- Note windows are frameless with `titleBarStyle: 'hiddenInset'` and always-on-top
- Window button visibility is disabled (`setWindowButtonVisibility(false)`)
- Windows are tracked by note UUID in `NoteWindowService`
- When a window closes, it's removed from the service's tracking Map

### Database
- Uses better-sqlite3 with database stored at `app.getPath('userData')/tada.db`
- Database client is created via `createClient` from `@tada/api` package
- All database operations go through the API layer with Zod validation
- Do not use `require` to import `better-sqlite3`

### Adding New Windows
To add a new window type:
1. Create HTML template in `tada/templates/[name].html`
2. Create React page at `tada/src/app/pages/[name]/page.tsx`
3. Add entry to `tada/vite.config.ts` rollupOptions.input
4. Create service in `tada/src/electron/services/` to manage window lifecycle
5. Register service in `tada/src/electron/main.ts`
