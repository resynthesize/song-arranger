#!/bin/bash

# Quick Check Script for Cyclone
# Runs common browser inspection tasks

echo "=== Cyclone Quick Check ==="
echo ""

# Check if dev server is running
echo "Checking if dev server is running..."
if curl -s http://localhost:5173 > /dev/null; then
  echo "✓ Dev server is running"
else
  echo "✗ Dev server is not running at http://localhost:5173"
  echo "  Run 'npm run dev' first"
  exit 1
fi

echo ""
echo "Running browser inspection..."
echo ""

# Run basic inspection
npm run inspect -- --screenshot screenshots/quick-check.png --wait-for "#root"

echo ""
echo "=== Quick Check Complete ==="
