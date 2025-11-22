#!/bin/bash

# Build APK Script for FakturaVakt
# This script will clean and build a release APK

set -e  # Exit on error

echo "======================================"
echo "  FakturaVakt - Build Release APK"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Ensure Android SDK path is known for Gradle
ANDROID_SDK_DIR="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
if [ -z "$ANDROID_SDK_DIR" ]; then
    for candidate in "$HOME/Android/Sdk" "/usr/local/lib/android/sdk" "/opt/android-sdk" "/usr/lib/android-sdk"; do
        if [ -d "$candidate" ]; then
            ANDROID_SDK_DIR="$candidate"
            break
        fi
    done
fi

if [ -n "$ANDROID_SDK_DIR" ]; then
    echo -e "${YELLOW}Step 1:${NC} Configuring Android SDK path..."
    cat <<EOF > android/local.properties
sdk.dir=$ANDROID_SDK_DIR
EOF
    echo -e "${GREEN}✓${NC} Using SDK at $ANDROID_SDK_DIR"
    echo ""
else
    echo -e "${YELLOW}Warning:${NC} ANDROID_SDK_ROOT / ANDROID_HOME not set and no default SDK path found."
    echo -e "         Gradle build will likely fail unless the SDK is installed."
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Step 2:${NC} Installing dependencies..."
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
    echo ""
fi

echo -e "${YELLOW}Step 3:${NC} Cleaning previous builds..."
cd android
./gradlew clean
cd ..
echo -e "${GREEN}✓${NC} Clean completed"
echo ""

echo -e "${YELLOW}Step 4:${NC} Clearing Metro bundler cache..."
rm -rf /tmp/metro-* 2>/dev/null || true
echo -e "${GREEN}✓${NC} Cache cleared"
echo ""

echo -e "${YELLOW}Step 5:${NC} Building Release APK..."
cd android
./gradlew assembleRelease
cd ..
echo -e "${GREEN}✓${NC} Build completed successfully!"
echo ""

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "======================================"
    echo -e "${GREEN}SUCCESS!${NC}"
    echo "======================================"
    echo ""
    echo "APK Location:"
    echo "  $APK_PATH"
    echo ""
    echo "APK Size: $APK_SIZE"
    echo ""
    echo "To install on connected device:"
    echo -e "  ${YELLOW}adb install $APK_PATH${NC}"
    echo ""
else
    echo "======================================"
    echo -e "${RED}ERROR!${NC}"
    echo "======================================"
    echo "APK file was not created. Check the build logs above for errors."
    exit 1
fi
