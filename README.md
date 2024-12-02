# Minipom

![Screenshot_20241128_084032](https://github.com/user-attachments/assets/073ab0b9-8daa-4eeb-9746-9e8541d2a31f)

A minimalistic Pomodoro timer desktop application built with Tauri and
SvelteKit, inspired by pomofocus.io

## Built with

- SvelteKit
- TypeScript
- Tailwind CSS
- Lucide Svelte
- TS Pattern
- Shadcn Svelte
- Tauri
- Rust
- Rodio

## Getting Started

### Requirements

- Node.js
- Rust

### Installation

#### Build from source

1. Clone the repository

```bash
git clone https://github.com/tfkhdyt/minipom.git
```

2. Install dependencies

```bash
cd minipom
pnpm install
```

3. Build the app

```bash
# linux (debian)
pnpm tauri build -b deb

# windows (exe)
pnpm tauri build -b nsis

# windows (msi)
pnpm tauri build -b msi

# macOS (app)
pnpm tauri build -b app

# macOS (dmg)
pnpm tauri build -b dmg
```
