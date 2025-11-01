#!/usr/bin/env python3
"""
Fix CSS spacing token fallback syntax errors
Pattern: var(--spacing-xxx, var(--spacing-xxx) → var(--spacing-xxx)
"""

import re
from pathlib import Path

# Find files with fallback syntax errors
problem_files = [
    "src/components/atoms/ConsoleInput/ConsoleInput.css",
    "src/components/atoms/ErrorBoundary/ErrorBoundary.module.css",
    "src/components/molecules/ConsoleHistory/ConsoleHistory.css",
    "src/components/organisms/CommandPalette/CommandPalette.css",
    "src/components/organisms/KeyboardHelp/KeyboardHelp.css",
]

total_fixes = 0

for file_path in problem_files:
    path = Path(file_path)
    if not path.exists():
        print(f"❌ File not found: {file_path}")
        continue

    content = path.read_text()
    original = content

    # Fix Pattern: var(--spacing-xxx, var(--spacing-xxx) → var(--spacing-xxx)
    # This handles cases where the fallback is malformed
    content = re.sub(
        r'var\(--spacing-([a-z0-9]+),\s*var\(--spacing-\1\)',
        r'var(--spacing-\1)',
        content
    )

    if content != original:
        path.write_text(content)
        lines_changed = original.count('\n') - content.count('\n') + 1
        print(f"✅ Fixed {file_path}")
        total_fixes += 1
    else:
        print(f"⚠️  No changes needed: {file_path}")

print(f"\nTotal files fixed: {total_fixes}/{len(problem_files)}")
