#!/bin/bash
# Fix GitHub repo: remove tracked files that should be excluded
# Run from project root
set -e

echo "🔧 Removing tracked files that should be excluded from GitHub..."

# Remove files/dirs that are still tracked but should be gone
git rm -r --cached .claude/ 2>/dev/null && echo "  ✅ .claude/" || echo "  ⏭️  .claude/ already removed"
git rm -r --cached AI_NOTES/ 2>/dev/null && echo "  ✅ AI_NOTES/" || echo "  ⏭️  AI_NOTES/ already removed"
git rm --cached CLAUDE.md 2>/dev/null && echo "  ✅ CLAUDE.md" || echo "  ⏭️  CLAUDE.md already removed"
git rm --cached GEMINI.md 2>/dev/null && echo "  ✅ GEMINI.md" || echo "  ⏭️  GEMINI.md already removed"
git rm -r --cached reward_craft_paper/ 2>/dev/null && echo "  ✅ reward_craft_paper/" || echo "  ⏭️  reward_craft_paper/ already removed"
git rm -r --cached presentations/ 2>/dev/null && echo "  ✅ presentations/" || echo "  ⏭️  presentations/ already removed"
git rm -r --cached docs/ 2>/dev/null && echo "  ✅ docs/" || echo "  ⏭️  docs/ already removed"
git rm -r --cached reference_materials/txt/ 2>/dev/null && echo "  ✅ reference_materials/txt/" || echo "  ⏭️  reference_materials/txt/ already removed"
git rm -r --cached reference_materials/md_versions/ 2>/dev/null && echo "  ✅ reference_materials/md_versions/" || echo "  ⏭️  reference_materials/md_versions/ already removed"

echo ""
echo "📦 Staging all changes..."
git add -A

echo ""
echo "📋 Status:"
git status --short | head -30

echo ""
echo "✅ Ready! Now run:"
echo '  git commit -m "Remove internal files from tracking"'
echo '  git push'

# Self-delete
rm -f fix_github.sh
