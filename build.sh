# Render.com Build Script
# This script runs during deployment

echo "Installing dependencies..."
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
echo "Step 2: Navigating to client folder..."
cd client || exit 1
echo "✓ In client folder: $(pwd)"

echo ""
echo "Step 3: Installing frontend dependencies..."
npm install
echo "✓ Frontend dependencies installed"

echo ""
echo "Step 4: Building React app..."
npm run build
echo "✓ React app built"

echo ""
echo "Step 5: Verifying build output..."
if [ -d "dist" ]; then
    echo "✓ dist folder exists"
    ls -la dist/
    if [ -f "dist/index.html" ]; then
        echo "✓ index.html found!"
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
