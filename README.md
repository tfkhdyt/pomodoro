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

- Bun (Node.js also supported)
- Rust

### Installation

1. Clone the repository

```bash
git clone https://github.com/tfkhdyt/pomodoro.git
```

1. Install dependencies

```bash
cd pomodoro
bun install
```

1. Build the app

```bash
# linux (debian)
bun tauri build -b deb

# windows (exe)
bun tauri build -b nsis

# windows (msi)
bun tauri build -b msi

# macOS (app)
bun tauri build -b app

# macOS (dmg)
bun tauri build -b dmg
```
