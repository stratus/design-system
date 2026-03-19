#!/usr/bin/env bash
# Cross-project verification: reads project-registry.json, runs tests + builds
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY="$SCRIPT_DIR/../project-registry.json"

if [[ ! -f "$REGISTRY" ]]; then
  echo "Error: project-registry.json not found."
  echo "Copy project-registry.example.json to project-registry.json and update paths."
  exit 1
fi

PASS=0
FAIL=0
SKIP=0

# Read projects from registry
PROJECTS=$(node -e "
  const reg = JSON.parse(require('fs').readFileSync('$REGISTRY', 'utf-8'));
  reg.projects
    .filter(p => p.status === 'migrated')
    .forEach(p => console.log(p.name + '|' + p.path.replace('~', process.env.HOME)));
")

if [[ -z "$PROJECTS" ]]; then
  echo "No migrated projects found in registry."
  exit 0
fi

echo "=== Design System: Cross-Project Verification ==="
echo ""

while IFS='|' read -r name path; do
  echo "── $name ($path)"

  if [[ ! -d "$path" ]]; then
    echo "   SKIP: directory not found"
    ((SKIP++))
    continue
  fi

  cd "$path"

  # Run tests
  if npm test --if-present 2>&1 | tail -5; then
    echo "   ✓ tests passed"
  else
    echo "   ✗ tests FAILED"
    ((FAIL++))
    continue
  fi

  # Run build
  if npm run build --if-present 2>&1 | tail -5; then
    echo "   ✓ build passed"
    ((PASS++))
  else
    echo "   ✗ build FAILED"
    ((FAIL++))
  fi

  echo ""
done <<< "$PROJECTS"

echo "=== Results: $PASS passed, $FAIL failed, $SKIP skipped ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
