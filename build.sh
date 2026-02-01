# Render.com Build Script
# This script runs during deployment

#!/bin/bash
set -e  # Exit on error

echo "========================================="
echo "Starting FURLS Dashboard Build"
echo "========================================="

echo ""
echo "Step 1: Installing backend dependencies..."
npm install
echo "✓ Backend dependencies installed"

echo ""
echo "Step 2: Installing frontend dependencies..."
cd client || exit 1
echo "✓ In client folder: $(pwd)"
npm install
echo "✓ Frontend dependencies installed"

echo ""
echo "Step 3: Building React app..."
# Use npx to ensure vite is found from node_modules
npx vite build
echo "✓ React app built"

echo ""
echo "Step 4: Verifying build output..."
if [ -d "dist" ]; then
    echo "✓ dist folder exists"
    ls -la dist/ | head -20
    if [ -f "dist/index.html" ]; then
        echo "✓ index.html found!"
        echo "✓ Build output verified successfully"
    else
        echo "✗ ERROR: index.html not found!"
        exit 1
    fi
else
    echo "✗ ERROR: dist folder not created!"
    exit 1
fi

echo ""
echo "========================================="
echo "Build Complete!"
echo "========================================="

echo "Build complete!"
