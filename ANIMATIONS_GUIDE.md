# دليل استخدام Animations و Transitions في Mazzady

## نظرة عامة

تم إضافة نظام animations و transitions احترافي للموقع يحافظ على الأداء العالي والسرعة مع تجربة مستخدم ممتازة.

## المميزات المضافة

### 1. Page Transitions (انتقالات الصفحات)

- **Fade Transition**: انتقال ناعم مع fade in/out
- **Slide Transition**: انتقال من اليمين/اليسار (LTR/RTL)
- **Scale & Fade**: تكبير/تصغير مع fade
- **Fade & Slide Up**: fade مع slide للأعلى

**الاستخدام:**
```typescript
// يتم تطبيق التلقائياً على جميع الصفحات
// يعتمد على اللغة (عربي = RTL, إنجليزي = LTR)
```

### 2. Smooth Scrolling

**الخدمة:** `SmoothScrollService`

```typescript
import { SmoothScrollService } from './core/smooth-scroll.service';

// Scroll to element
this.smoothScrollService.scrollToElement('section-id', 80, 600);

// Scroll to top
this.smoothScrollService.scrollToTop(600);
```

### 3. Micro-interactions

#### Utility Classes المتاحة:

```sass
// Fade in animation
.animate-fade-in

// Slide in animations
.animate-slide-in-right
.animate-slide-in-left
.animate-slide-up

// Scale animations
.animate-scale-in
.animate-bounce-in

// Hover effects
.hover-lift      // رفع العنصر عند hover
.hover-glow      // توهج ذهبي عند hover
.hover-scale     // تكبير عند hover

// Button press
.press-animation // تصغير عند الضغط

// Loading shimmer
.shimmer         // تأثير shimmer للعناصر المحمّلة
```

### 4. View Transitions API

**الخدمة:** `ViewTransitionService`

```typescript
import { ViewTransitionService } from './core/view-transition.service';

// Check support
if (this.viewTransitionService.isSupported()) {
  // Use view transitions
  this.viewTransitionService.startTransition(() => {
    // Your code here
  });
}
```

## تحسينات الأداء

### GPU Acceleration

جميع الـ animations تستخدم:
- `transform: translateZ(0)` - تفعيل GPU acceleration
- `will-change` - تحسين الأداء
- `backface-visibility: hidden` - تحسين rendering

### CSS Containment

استخدام `contain: layout style paint` لتحسين الأداء

### Reduced Motion Support

دعم `prefers-reduced-motion` للأشخاص الذين يفضلون تقليل الحركة

## أفضل الممارسات

1. **استخدم GPU-accelerated properties:**
   - ✅ `transform`, `opacity`
   - ❌ `top`, `left`, `width`, `height`

2. **استخدم `will-change` بحذر:**
   - فقط للعناصر التي ستتحرك
   - احذفها بعد الانتهاء

3. **استخدم `cubic-bezier` للانتقالات السلسة:**
   - `cubic-bezier(0.4, 0, 0.2, 1)` - standard
   - `cubic-bezier(0.34, 1.56, 0.64, 1)` - bounce

4. **قلل من مدة الـ animations:**
   - 200-300ms للـ micro-interactions
   - 300-400ms للـ page transitions

## الأمثلة

### مثال 1: إضافة hover effect على card

```html
<div class="card hover-lift">
  <!-- Content -->
</div>
```

### مثال 2: Fade in animation

```html
<div class="animate-fade-in">
  <!-- Content -->
</div>
```

### مثال 3: Stagger animation للعناصر المتتالية

```html
<div class="stagger-item">Item 1</div>
<div class="stagger-item">Item 2</div>
<div class="stagger-item">Item 3</div>
```

## الملاحظات

- جميع الـ animations متوافقة مع RTL/LTR
- الـ animations تتكيف تلقائياً مع اللغة المختارة
- تم تحسين الأداء لضمان سرعة عالية
- دعم كامل لـ reduced motion preference
