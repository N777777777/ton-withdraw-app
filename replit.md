# TON Auto Withdraw - تطبيق ويب

## نظرة عامة
تطبيق ويب لسحب عملة TON تلقائياً من محفظة Tonkeeper بواجهة سهلة الاستخدام.

## الهدف
تطوير تطبيق ويب آمن وسهل الاستخدام لسحب عملة TON من محفظة Tonkeeper للتعلم والتجربة.

## الحالة الحالية
- ✅ تطبيق ويب كامل بواجهة احترافية
- ✅ صفحة رئيسية تعريفية
- ✅ صفحة إعدادات لعرض حالة الـ Secrets
- ✅ صفحة سحب لإجراء التحويلات
- ✅ عرض الرصيد في الوقت الفعلي
- ✅ دعم mainnet و testnet
- ✅ أمان عالي باستخدام Replit Secrets
- ✅ لا يوجد تخزين لكلمات المحفظة في الكود
- ✅ ميزة تحميل ملفات المشروع كـ ZIP

## التغييرات الأخيرة
- **2025-11-21**: 
  - تحويل السكربت إلى تطبيق ويب كامل
  - إضافة Express.js كـ backend
  - إنشاء 3 صفحات: الرئيسية، الإعدادات، السحب
  - تصميم واجهة احترافية باللغة العربية
  - تطبيق معايير الأمان: استخدام Replit Secrets فقط
  - إزالة dotenv واستخدام process.env مباشرة
  - إضافة API endpoints: /api/settings, /api/balance, /api/withdraw
  
- **2025-11-20**: 
  - إنشاء المشروع من الصفر كسكربت CLI
  - إضافة السكربت الرئيسي (index.js)

## معلومات المشروع

### البنية التقنية
- **اللغة**: JavaScript (ES Modules)
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **المكتبات الرئيسية**:
  - `@ton/ton`: التعامل مع TON blockchain
  - `@ton/core`: العمليات الأساسية والعناوين
  - `@ton/crypto`: التشفير وتحويل mnemonic
  - `express`: Web server
  - `body-parser`: معالجة JSON requests
  - `chalk`: تحسين عرض logs

### البنية المعمارية
```
ton-auto-withdraw/
├── server.js              # Express server رئيسي
├── index.js               # سكربت CLI القديم (للاستخدام المباشر)
├── deploy-wallet.js       # utility لتفعيل المحفظة
├── package.json           # إعدادات Node.js
├── .gitignore            # ملفات محظورة من Git
├── README.md             # دليل المستخدم
├── replit.md             # هذا الملف
└── public/               # ملفات الواجهة
    ├── index.html        # الصفحة الرئيسية
    ├── settings.html     # صفحة الإعدادات
    ├── withdraw.html     # صفحة السحب
    ├── styles.css        # التنسيقات
    ├── settings.js       # JavaScript للإعدادات
    └── withdraw.js       # JavaScript للسحب
```

### طريقة العمل
1. المستخدم يضيف Secrets في Replit (WALLET_MNEMONIC, NETWORK, إلخ)
2. التطبيق يقرأ الـ Secrets من process.env
3. صفحة السحب تعرض الرصيد الحالي
4. المستخدم يدخل العنوان والمبلغ
5. التطبيق ينفذ التحويل ويعرض النتيجة
6. يمكن متابعة المعاملة على TON Explorer

### API Endpoints
- **GET /api/settings**: عرض حالة الإعدادات (هل الـ Secrets معدة؟)
- **GET /api/balance**: جلب رصيد المحفظة
- **POST /api/withdraw**: تنفيذ عملية سحب
- **GET /api/download-project**: تحميل ملفات المشروع كـ ZIP

## تفضيلات المستخدم
- **اللغة**: العربية
- **الهدف**: التجربة والتعلم (ليس للاستخدام الإنتاجي)
- **محفظة**: Tonkeeper
- **الاستخدام المستقبلي**: دمج السحب التلقائي في بوت

## الأمان والتحذيرات
✅ **تطبيق آمن**:
- استخدام Replit Secrets المشفرة فقط
- لا يوجد إدخال لكلمات المحفظة عبر صفحات الويب
- لا يوجد تخزين للـ secrets في الكود أو قاعدة بيانات
- الـ secrets تُقرأ من process.env مباشرة

⚠️ **تحذير عام**: هذا المشروع للتجربة فقط!
- يُنصح باستخدام testnet للتعلم
- يجب استخدام محفظة تجريبية
- لا تشارك الـ Secrets مع أي شخص

## Replit Secrets المطلوبة
لتشغيل التطبيق، أضف هذه الـ Secrets في Replit:

1. **WALLET_MNEMONIC** (مطلوب): 24 كلمة من محفظة Tonkeeper
2. **NETWORK** (مطلوب): `mainnet` أو `testnet`
3. **TONCENTER_API_KEY** (اختياري): من @tonapibot على Telegram
4. **RECIPIENT_ADDRESS** (اختياري): عنوان افتراضي للسحب
5. **AMOUNT** (اختياري): مبلغ افتراضي
6. **TRANSFER_COMMENT** (اختياري): رسالة افتراضية

## ملاحظات المطور
- WalletContractV4 هو الإصدار المستخدم (متوافق مع Tonkeeper)
- رسوم الشبكة تقريباً 0.01-0.05 TON لكل معاملة
- المعاملات على TON تستغرق ~5 ثوانٍ للتأكيد
- testnet مجاني ومناسب للتجربة عبر @testgiver_ton_bot
- التطبيق يعمل على port 5000
- يمكن استخدام `npm run script` لتشغيل السكربت CLI القديم

## الموارد
- [TON Documentation](https://docs.ton.org/)
- [TON SDK GitHub](https://github.com/ton-org/ton)
- [Tonkeeper](https://tonkeeper.com/)
- [Replit Secrets](https://docs.replit.com/programming-ide/workspace-features/secrets)
