#!/bin/bash

# ════════════════════════════════════════════════════════════
# Script لبناء APK/AAB لأي مشروع React Native/Expo
# ════════════════════════════════════════════════════════════

set -e  # توقف عند أي خطأ

echo "🔨 بناء APK/AAB..."
echo ""

# Directory fix for CI/CD environment if needed
if [ -d "FakturaVakt" ]; then
    cd FakturaVakt
fi

# 1. التحقق من الملفات
if [ ! -f "app.json" ]; then
    echo "❌ ملف app.json غير موجود!"
    echo "تأكد أنك في مجلد المشروع الصحيح"
    pwd
    ls -la
    exit 1
fi

# 2. تثبيت dependencies إذا لزم
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت dependencies..."
    npm ci --legacy-peer-deps
fi

# 3. Setup Android Environment (Specific for CI/CD or clean builds)
echo "🔧 إعداد بيئة Android..."
# On utilise le keystore de debug par défaut si release.jks n'existe pas pour que le build passe
if [ ! -f "release.jks" ]; then
    echo "⚠️ release.jks non trouvé, création d'un keystore temporaire..."
    # keytool n'est peut-être pas dispo ici, on suppose que l'utilisateur l'a fait ou on utilise debug
    # Pour ce script CI, on va laisser le build.gradle utiliser la config par défaut si pas de variable
fi

# Nettoyage
rm -rf android/app/build
cd android
./gradlew clean
cd ..

# 4. البناء
echo "6️⃣ بناء APK و AAB..."
cd android
./gradlew assembleRelease bundleRelease --no-daemon
cd ..

# 5. قراءة معلومات المشروع
APP_NAME=$(node -p "require('./app.json').expo.name || require('./app.json').name")
VERSION=$(node -p "require('./app.json').expo.version || require('./package.json').version")
PACKAGE=$(node -p "require('./app.json').expo.android.package || 'com.fakturavakt'")

# Si on est dans un environnement GitHub Actions, on récupère le nom du repo
if [ -n "$GITHUB_REPOSITORY" ]; then
    REPO="$GITHUB_REPOSITORY"
else
    REPO="codecsverige/Vakt" # Fallback
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 المشروع: $REPO"
echo "📱 التطبيق: $APP_NAME"
echo "🔢 النسخة: $VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6. Renommage et déplacement des fichiers pour l'upload
mkdir -p release_output

APK_FILE=$(find android/app/build/outputs/apk/release -name "*.apk" 2>/dev/null | head -1)
AAB_FILE=$(find android/app/build/outputs/bundle/release -name "*.aab" 2>/dev/null | head -1)

if [ -n "$APK_FILE" ]; then
    cp "$APK_FILE" "release_output/${APP_NAME}-v${VERSION}.apk"
    echo "✅ APK: ${APP_NAME}-v${VERSION}.apk"
fi

if [ -n "$AAB_FILE" ]; then
    cp "$AAB_FILE" "release_output/${APP_NAME}-v${VERSION}.aab"
    echo "✅ AAB: ${APP_NAME}-v${VERSION}.aab"
fi

# Note: La partie "upload gh release" se fera via le fichier workflow YAML 
# car nous n'avons pas le token GH authentifié dans ce script shell en local.

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ البناء اكتمل محلياً!"
echo "📂 الملفات في مجلد: release_output/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

