# حل مشكلة @angular/animations

## الطريقة السريعة (Windows):

### الطريقة 1: استخدام ملف التثبيت التلقائي

**في PowerShell:**
```powershell
cd frontend
.\install-animations.ps1
```

**أو في CMD:**
```cmd
cd frontend
install-animations.bat
```

### الطريقة 2: التثبيت اليدوي

افتح Terminal في VS Code (Ctrl + `) أو PowerShell في مجلد `frontend` واكتب:

```bash
npm install @angular/animations@^21.0.0 --legacy-peer-deps
```

### الطريقة 3: التثبيت الكامل

```bash
cd frontend
npm install --legacy-peer-deps
```

## بعد التثبيت:

1. يجب أن يختفي الخطأ
2. إعادة تشغيل VS Code إذا لزم الأمر
3. إعادة تشغيل Angular Dev Server إذا كان يعمل

## التحقق من التثبيت:

بعد التثبيت، تحقق من وجود المجلد:
```
frontend/node_modules/@angular/animations
```

إذا كان موجوداً، التثبيت نجح! ✅

## ملاحظة:

إذا لم تعمل أي طريقة، جرب:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```
