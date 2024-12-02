{
  description = "Minipom - Minimalistic Pomodoro Timer Desktop App";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    {
      packages.x86_64-linux =
        let
          pkgs = nixpkgs.legacyPackages.x86_64-linux;
        in
        {
          default = pkgs.callPackage ./default.nix { };
          minipom = pkgs.callPackage ./default.nix { };
        };

      # Optional: Development shell for x86_64-linux
      # devShells.x86_64-linux = pkgs.mkShell {
      #   buildInputs = [
      #     pkgs.nodejs_22
      #     pkgs.cargo
      #     pkgs.rustc
      #     # Add other dev dependencies
      #   ];
      # };
    };
}
