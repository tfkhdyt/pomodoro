{
  lib,
  stdenv,
  rustPlatform,
  cargo-tauri,
  darwin,
  glib-networking,
  nodejs_22,
  openssl,
  pkg-config,
  wrapGAppsHook3,
  gobject-introspection,
  at-spi2-atk,
  atkmm,
  cairo,
  gdk-pixbuf,
  glib,
  gtk3,
  harfbuzz,
  librsvg,
  libsoup_3,
  pango,
  webkitgtk_4_1,
  alsa-lib,
  zlib,
  pnpm_9,
}:

rustPlatform.buildRustPackage rec {
  pname = "minipom";
  version = "0.9.3";
  src = ./.;

  cargoLock = {
    lockFile = ./src-tauri/Cargo.lock;
  };

  pnpmDeps = pnpm_9.fetchDeps {
    inherit pname version src;
    hash = "sha256-pk4ask944MHmJYZNxi1q7DWMm9yNdvNi7FGXGtXewk8=";
  };

  nativeBuildInputs = [
    cargo-tauri.hook

    nodejs_22
    pnpm_9.configHook

    pkg-config
    wrapGAppsHook3

    gobject-introspection
  ];

  buildInputs =
    [ openssl ]
    ++ lib.optionals stdenv.hostPlatform.isLinux [
      glib-networking
      at-spi2-atk
      atkmm
      cairo
      gdk-pixbuf
      glib
      gtk3
      harfbuzz
      librsvg
      libsoup_3
      pango
      webkitgtk_4_1
      zlib
      alsa-lib
    ]
    # not tested yet
    ++ lib.optionals stdenv.hostPlatform.isDarwin (
      with darwin.apple_sdk.frameworks;
      [
        AppKit
        CoreServices
        Security
        WebKit
      ]
    );

  cargoRoot = "src-tauri";
  buildAndTestSubdir = cargoRoot;

  meta = {
    homepage = "https://github.com/tfkhdyt/minipom";
    description = "Minimalistic Pomodoro Timer Desktop App";
    license = lib.licenses.gpl3Only;
    maintainers = with lib.maintainers; [ tfkhdyt ];
    mainProgram = "minipom";
  };
}
