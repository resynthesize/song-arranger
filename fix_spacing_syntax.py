#!/usr/bin/env python3
"""
Fix CSS spacing token syntax errors
Fixes malformed replacements from previous script
"""

import re
from pathlib import Path

# Find all CSS files with syntax errors
css_files = [
    "src/components/atoms/ConsoleInput/ConsoleInput.css",
    "src/components/atoms/ErrorBoundary/ErrorBoundary.module.css",
    "src/components/molecules/ConsoleAutocomplete/ConsoleAutocomplete.css",
    "src/components/molecules/ConsoleHistory/ConsoleHistory.css",
    "src/components/molecules/ResizableDivider/ResizableDivider.module.css",
    "src/components/molecules/RowSelector/RowSelector.module.css",
    "src/components/organisms/ColorPicker/ColorPicker.css",
    "src/components/organisms/CommandFooter/CommandFooter.css",
    "src/components/organisms/CommandPalette/CommandPalette.css",
    "src/components/organisms/Help/Help.css",
    "src/components/organisms/KeyboardHelp/KeyboardHelp.css",
    "src/components/organisms/LiveConsole/LiveConsole.css",
    "src/components/organisms/ProjectSelector/ProjectSelector.css",
    "src/components/organisms/QuickInput/QuickInput.css",
    "src/components/organisms/SongDataViewer/SongDataViewer.module.css",
    "src/components/organisms/TrackSettingsDialog/TrackSettingsDialog.module.css",
]

total_fixes = 0

for file_path in css_files:
    path = Path(file_path)
    if not path.exists():
        print(f"❌ File not found: {file_path}")
        continue

    content = path.read_text()
    original = content

    # Fix Pattern 1: var(--spacing-xxx)text → var(--spacing-xxx)
    # Match: var(--spacing-[token])[letters]
    content = re.sub(
        r'var\(--spacing-([a-z0-9]+)\)([a-z]+)',
        r'var(--spacing-\1)',
        content
    )

    # Fix Pattern 2: var(--spacing-xxx, var(--spacing-xxx)text; → var(--spacing-xxx);
    # Match: var(--spacing-[token], var(--spacing-[token])[letters];
    content = re.sub(
        r'var\(--spacing-([a-z0-9]+),\s*var\(--spacing-\1\)([a-z]*);',
        r'var(--spacing-\1);',
        content
    )

    # Fix Pattern 3: Completely mangled multi-value like:
    # padding: var(--spacing-3xl)paddingvar(--spacing-lg)padding
    # This is harder - let's look for multiple var() in one value
    content = re.sub(
        r'((?:padding|margin|gap|top|right|bottom|left|border-radius|width|height):\s*)var\(--spacing-([a-z0-9]+)\)[a-z]+\s*var\(--spacing-([a-z0-9]+)\)[a-z]+',
        r'\1var(--spacing-\2) var(--spacing-\3)',
        content
    )

    if content != original:
        path.write_text(content)
        fixes = len(re.findall(r'var\(--spacing-', content)) - len(re.findall(r'var\(--spacing-', original))
        fixes = content.count('var(--spacing-') - original.count('var(--spacing-')
        # Count actual changes
        fixes = len(original) - len(content)  # rough estimate
        print(f"✅ Fixed {file_path}")
        total_fixes += 1
    else:
        print(f"⚠️  No changes needed: {file_path}")

print(f"\nTotal files fixed: {total_fixes}/{len(css_files)}")
