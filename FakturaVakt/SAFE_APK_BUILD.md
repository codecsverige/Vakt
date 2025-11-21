## دليل بناء APK ثابت وآمن

هذا الدليل يلخّص كل ما تحتاجه لإخراج ملف APK يعمل دون انهيارات أو مشاكل توقيع.

---

### 1. الملفات المهمّة حاليًا
- `FakturaVakt-v0.0.2.apk` في جذر المستودع: بناء قديم (قبل إصلاح مشكلة الأيقونات) ويُنصح بعدم توزيعه.
- الشفرة المحدثة داخل مجلد `FakturaVakt/`، وتشمل جميع الإصلاحات الخاصة بـ ProGuard، MultiDex، وغيرها.

---

### 2. حلّ مشكلة الانهيار (خطوط Ionicons)
التطبيق يستعمل `Ionicons` في كل الشاشة، لذا يجب تضمين الخط داخل الـAPK.

1. من داخل مجلد `FakturaVakt` نفّذ:
   ```bash
   npx react-native-asset
   ```
   سيُنشئ المجلد `android/app/src/main/assets/fonts/` ويضع فيه `Ionicons.ttf`.
2. إذا لم ينجح الأمر، أضف السطر التالي في أعلى `android/app/build.gradle`:
   ```gradle
   apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
   ```
   لتتولّى Gradle نسخ الخطوط تلقائيًا.

من دون هذه الخطوة سيظهر خطأ `Font asset not found` ويتعطل التطبيق مباشرة.

---

### 3. خطوات البناء الأساسية
1. تثبيت التبعيات (مرّة واحدة أو بعد تحديث الحزم):
   ```bash
   cd FakturaVakt
   npm install
   ```
2. تنظيف أي بناء قديم:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
3. بناء APK الإصدار:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
4. ستجد الملف الناتج هنا:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

> **اختصار:** من جذر المشروع شغّل `npm run build:android` وسيقوم السكريبت `build-apk.sh` بتنفيذ كل ما سبق (تثبيت، تنظيف، بناء).

---

### 4. إعداد Keystore للإنتاج (اختياري لكنه مهم للنشر)
1. إنشاء مفتاح إنتاج داخل `android/app/`:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore release.keystore -alias release-key \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. حفظ كلمات المرور في `android/gradle.properties`:
   ```properties
   MYAPP_RELEASE_STORE_FILE=release.keystore
   MYAPP_RELEASE_KEY_ALIAS=release-key
   MYAPP_RELEASE_STORE_PASSWORD=كلمة_المخزن
   MYAPP_RELEASE_KEY_PASSWORD=كلمة_المفتاح
   ```
3. تعديل `android/app/build.gradle` داخل قسم `signingConfigs`/`buildTypes`:
   ```gradle
   signingConfigs {
     release {
       storeFile file(MYAPP_RELEASE_STORE_FILE)
       storePassword MYAPP_RELEASE_STORE_PASSWORD
       keyAlias MYAPP_RELEASE_KEY_ALIAS
       keyPassword MYAPP_RELEASE_KEY_PASSWORD
     }
   }

   buildTypes {
     release {
       signingConfig signingConfigs.release
       minifyEnabled false
       shrinkResources false
     }
   }
   ```

إذا لم تُضِف keystore إنتاجي، سيستخدم البناء الحالي مفتاح debug (للأجهزة الاختبارية فقط).

---

### 5. التحقق بعد البناء
1. تثبيت على جهاز متصل:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```
2. مراقبة السجلات للتأكد من عدم وجود أخطاء فونت/أيقونات:
   ```bash
   adb logcat | grep -i "Ionicons\|Font asset"
   ```
   يجب ألا يظهر أي تحذير حول `Font asset not found`.

---

### 6. نشر الملف على GitHub (اختياري)
1. ادفع الفرع الذي يحتوي الإصلاحات:
   ```bash
   git push origin <اسم-الفرع>
   ```
2. من صفحة Actions في GitHub شغّل Workflow **Build Android APK** وحدد نفس الفرع.
3. بعد نجاح الـworkflow سيكون الملف متاحًا من صفحة Releases (لن تحتاج لأي خدمة خارجية).

---

### 7. ملخص سريع
- **السبب الرئيسي للانهيار:** عدم تضمين خط Ionicons.
- **الحل:** `npx react-native-asset` أو ربط `fonts.gradle`.
- **أمر البناء الأساسي:** `cd android && ./gradlew assembleRelease`.
- **الملف الناتج:** `android/app/build/outputs/apk/release/app-release.apk`.
- **للنشر الاحترافي:** أنشئ keystore خاص وحدّث إعدادات Gradle كما في الخطوات أعلاه.
