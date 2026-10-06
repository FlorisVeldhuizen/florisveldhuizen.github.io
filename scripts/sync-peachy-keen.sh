#!/usr/bin/env bash
# Copies peachy-keen from this repo into the standalone peachy-keen repo, then commits and pushes there.
# Usage: scripts/sync-peachy-keen.sh [ref] [standalone-dir]
set -euo pipefail

site_dir=$(cd "$(dirname "$0")/.." && pwd)
ref=${1:-master}
target=${2:-"$site_dir/../peachy-keen"}
keep=(.git package.json vite.config.js .gitignore README.md yarn.lock node_modules wrangler.jsonc)

if [ -n "$(git -C "$target" status --porcelain)" ]; then
  echo "Standalone repo has uncommitted changes: $target" >&2
  exit 1
fi

sha=$(git -C "$site_dir" rev-parse --short "$ref")
subject=$(git -C "$site_dir" log -1 --format=%s "$ref")

find_args=()
for name in "${keep[@]}"; do find_args+=(! -name "$name"); done
find "$target" -mindepth 1 -maxdepth 1 "${find_args[@]}" -exec rm -rf {} +

git -C "$site_dir" archive "$ref" src/peachy-keen | tar -x -C "$target" --strip-components=2
mkdir -p "$target/public"
git -C "$site_dir" archive "$ref" src/public/peachy-keen | tar -x -C "$target/public" --strip-components=2

git -C "$target" add -A
if git -C "$target" diff --cached --quiet; then
  echo "Nothing to sync at $sha."
  exit 0
fi
git -C "$target" commit -q -m "Sync from florisveldhuizen.github.io $sha" -m "$subject"
git -C "$target" push
