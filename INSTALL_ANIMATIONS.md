# تثبيت @angular/animations

## المشكلة
المشروع يحتاج إلى `@angular/animations` لكنه غير مثبت بعد.

## الحل

قم بتشغيل الأمر التالي في مجلد `frontend`:

```bash
cd frontend
npm install @angular/animations@^21.0.0
```

أو ببساطة:

```bash
cd frontend
npm install
```

سيقوم بتثبيت جميع المكتبات المضافة في `package.json` بما فيها `@angular/animations`.

## ملاحظة

إذا واجهت مشاكل في التثبيت، جرب:

```bash
cd frontend
npm install @angular/animations@^21.0.0 --legacy-peer-deps
```

بعد التثبيت، يجب أن يعمل المشروع بدون أخطاء.
