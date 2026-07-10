[![Release app](https://github.com/rafalolszewski94/loot-mob-creator/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/rafalolszewski94/loot-mob-creator/actions/workflows/build.yml)

# Loot Mob Creator for Canary based OTS

Desktop app built with **Tauri v2**, **Next.js**, **React**, **Tailwind CSS v4**, and **coss ui** (Base UI).

## Stack

- Tauri v2 (desktop shell)
- Next.js 16 (static export)
- React 19
- Tailwind CSS v4
- coss ui / shadcn (Base UI primitives)
- Bun (package manager)

## Development

Install dependencies:

```bash
bun install
```

Run the web UI only:

```bash
bun run dev
```

Run the desktop app:

```bash
bun run tauri:dev
```

Build the desktop app:

```bash
bun run tauri:build
```

## Usage

1. Open the app
2. Enter a monster name (for example: `Orc`)
3. Click **Generate loot**
4. Copy the generated Lua loot table

Use **Items mapping** to map Tibia Wiki item names to server item IDs.
