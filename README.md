[![Release app](https://github.com/orafal-dev/loot-mob-creator/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/orafal-dev/loot-mob-creator/actions/workflows/build.yml)

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

## Auto updates

The desktop app checks GitHub Releases for updates and shows an **Install update** button in the sidebar when a newer signed build is available.

### One-time signing setup

Generate a signing key pair (keep the private key secret):

```bash
bun run tauri signer generate -w ~/.tauri/loot-mob-creator.key --ci
```

1. Copy the contents of `~/.tauri/loot-mob-creator.key.pub` into `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.
2. Add the private key to the GitHub repository secret `TAURI_SIGNING_PRIVATE_KEY` (file contents or path).
3. If the key has a password, also set `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

Tagged releases built by `.github/workflows/release.yml` upload `latest.json` and signed updater artifacts automatically when the secret is configured.

## Usage

1. Open the app
2. Enter a monster name (for example: `Orc`)
3. Click **Generate loot**
4. Copy the generated Lua loot table

Use **Items mapping** to map Tibia Wiki item names to server item IDs.
