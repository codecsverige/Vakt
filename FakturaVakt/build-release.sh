#!/bin/bash
set -e

# 1. Run the standard build script
./build-apk.sh

# 2. Create output directory
mkdir -p release_output

# 3. Get version name from package.json
VERSION=$(grep '"version":' package.json | cut -d '"' -f 4)
APP_NAME="FakturaVakt"

# 4. Copy and rename the APK
cp android/app/build/outputs/apk/release/app-release.apk "release_output/${APP_NAME}-v${VERSION}.apk"

echo "Build complete. Artifacts moved to release_output/"
ls -la release_output/
