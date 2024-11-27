# Pomodoro

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

1. Clone the repository

```bash
git clone https://github.com/tfkhdyt/pomodoro.git
```

1. Install dependencies

```bash
cd pomodoro
pnpm install
```

1. Build the app

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
