#!/bin/bash
# Script for moving backend files to root structure
# Run this from the project root directory

echo "Moving files to root structure..."

# Create api directory in root if it doesn't exist
mkdir -p api

# Copy all API files to api/ directory
echo "Copying API files..."
cp backend/api/*.php api/

# Copy index.php to root
echo "Copying index.php..."
cp backend/index.php index.php

# Copy .htaccess to root
echo "Copying .htaccess..."
cp backend/.htaccess .htaccess

echo "Done!"
echo ""
echo "Next steps:"
echo "1. Upload everything to server root"
echo "2. Make sure api/ directory exists in root"
echo "3. Make sure backend/ directory exists in root"
echo "4. Set permissions: chmod 755 api/ backend/ backend/data/"
echo "5. Test: https://henrikb30.sg-host.com?page=dashboard"

