# تعليمات بناء APK / Build APK Instructions

## المشاكل التي تم إصلاحها / Fixed Issues

✅ **إضافة قواعد ProGuard الشاملة** - تم إضافة جميع القواعد المطلوبة لـ React Native والمكتبات الأصلية
✅ **إضافة خيارات التغليف** - تم إصلاح مشاكل الملفات المكررة
✅ **تمكين MultiDex** - لدعم عدد كبير من الأساليب (methods)
✅ **تعطيل تقليص الموارد** - لتجنب مشاكل الموارد المفقودة

## خطوات بناء APK / Build Steps

### 1. تنظيف المشروع / Clean the project

```bash
cd FakturaVakt/android
./gradlew clean
cd ..
```

### 2. بناء APK الإصدار / Build Release APK

اختر واحدة من الطرق التالية:

#### الطريقة الأولى: باستخدام React Native CLI
```bash
cd FakturaVakt
npx react-native build-android --mode=release
```

#### الطريقة الثانية: باستخدام Gradle مباشرة
```bash
cd FakturaVakt/android
./gradlew assembleRelease
cd ..
```

### 3. موقع ملف APK / APK Location

بعد النجاح، ستجد ملف APK في:
```
FakturaVakt/android/app/build/outputs/apk/release/app-release.apk
```

## إنشاء APK موقع للإنتاج / Creating a Signed Production APK

⚠️ **ملاحظة مهمة**: حاليًا التطبيق يستخدم مفتاح التطوير (debug keystore). للإنتاج، يجب إنشاء مفتاح خاص.

### إنشاء مفتاح الإنتاج / Generate Production Keystore

```bash
cd FakturaVakt/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

سيُطلب منك:
- كلمة مرور للمخزن (store password)
- كلمة مرور للمفتاح (key password)
- معلوماتك (الاسم، المنظمة، إلخ)

### تكوين المفتاح في Gradle / Configure Key in Gradle

1. أنشئ ملف `android/gradle.properties` (أو عدّل الموجود):

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=release-key
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

2. عدّل `android/app/build.gradle` - أضف في قسم `signingConfigs`:

```gradle
release {
    if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword MYAPP_RELEASE_STORE_PASSWORD
        keyAlias MYAPP_RELEASE_KEY_ALIAS
        keyPassword MYAPP_RELEASE_KEY_PASSWORD
    }
}
```

3. في قسم `buildTypes.release`، غيّر:
```gradle
signingConfig signingConfigs.release  // بدلاً من signingConfigs.debug
```

## استكشاف الأخطاء / Troubleshooting

### التطبيق ما زال يتعطل؟ / App Still Crashing?

1. **تحقق من السجلات / Check Logs**:
```bash
adb logcat | grep -i "crash\|error\|exception"
```

2. **تأكد من تنظيف الكاش / Clear Cache**:
```bash
cd FakturaVakt
rm -rf android/app/build
rm -rf android/.gradle
npx react-native start --reset-cache
```

3. **أعد بناء المشروع / Rebuild**:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### مشاكل شائعة / Common Issues

#### 1. Out of Memory Error
أضف في `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

#### 2. MultiDex Issue
تم إصلاحه بالفعل في التكوين، لكن إذا واجهت مشاكل:
- تأكد من `multiDexEnabled true` في `build.gradle`

#### 3. Native Module Not Found
```bash
cd FakturaVakt
rm -rf node_modules
npm install
cd android
./gradlew clean
```

## التحقق من صحة APK / Verify APK

بعد البناء، تحقق من صحة APK:

```bash
# تثبيت على جهاز متصل
adb install FakturaVakt/android/app/build/outputs/apk/release/app-release.apk

# أو سحب الملف ونقله
adb pull FakturaVakt/android/app/build/outputs/apk/release/app-release.apk ~/Desktop/
```

## الميزات المضمنة في البناء / Features Included in Build

- ✅ Hermes Engine (محرك JavaScript محسّن)
- ✅ New Architecture (البنية الجديدة لـ React Native)
- ✅ ProGuard Rules (قواعد الحماية من التشويش)
- ✅ All Native Modules (جميع الوحدات الأصلية)
- ✅ RTL Support (دعم الكتابة من اليمين لليسار)
- ✅ Notifications (الإشعارات)
- ✅ Camera & Media (الكاميرا والوسائط)
- ✅ Encrypted Storage (التخزين المشفر)

## معلومات إضافية / Additional Info

- **حجم APK التقريبي**: 40-60 MB (يعتمد على البنيات المضمنة)
- **البنيات المدعومة**: armeabi-v7a, arm64-v8a, x86, x86_64
- **الحد الأدنى للأندرويد**: API 24 (Android 7.0)
- **الهدف**: API 36 (Android 14+)

---

## للمزيد من المساعدة / For More Help

إذا استمرت المشاكل:
1. قم بمشاركة سجلات الخطأ (error logs)
2. أرفق ملف `logcat` الكامل
3. حدد إصدار الأندرويد الذي تختبر عليه
