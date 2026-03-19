#!/usr/bin/env bash
# Sync generated tokens to consumer projects that inline them.
# Usage: ./scripts/sync-tokens.sh
#
# This script rebuilds tokens, then prints the generated CSS for manual
# copy-paste into consumer projects' globals.css files.
# (Full auto-replacement is deferred until projects adopt a standard marker comment.)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

echo "=== Rebuilding tokens ==="
cd "$ROOT" && node scripts/build-tokens.js

echo ""
echo "=== Generated CSS tokens ==="
echo "Copy the :root and .light blocks from:"
echo "  $ROOT/platforms/css/tokens.css"
echo ""
echo "Into each consumer project's globals.css, replacing the"
echo "'Design System Tokens' section."
echo ""
echo "=== Generated Tailwind preset ==="
echo "Copy the @theme inline block from:"
echo "  $ROOT/platforms/tailwind/preset.css"
echo ""
echo "Files updated:"
ls -la "$ROOT/platforms/css/tokens.css" "$ROOT/platforms/tailwind/preset.css" "$ROOT/platforms/json/tokens.json"
