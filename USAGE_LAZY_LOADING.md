# استخدام Lazy Loading للصور

## المميزات

تم إضافة directive `appImageLazyLoad` للصور لتحسين الأداء.

## الاستخدام

### في HTML:

```html
<!-- بدلاً من -->
<img src="image.jpg" alt="..." />

<!-- استخدم -->
<img [appImageLazyLoad]="imageUrl" [placeholder]="placeholderUrl" alt="..." />
```

### في Components:

1. استورد الـ directive:

```typescript
import { ImageLazyLoadDirective } from './shared/image-lazy-load.directive';

@Component({
  imports: [ImageLazyLoadDirective, ...],
  ...
})
```

2. استخدم في الـ template:

```html
<img [appImageLazyLoad]="product.imageUrl" alt="Product" />
```

## المميزات

- ✅ تحميل الصور عند ظهورها فقط
- ✅ Placeholder أثناء التحميل
- ✅ Fade in عند تحميل الصورة
- ✅ تحسين الأداء والسرعة
- ✅ دعم Intersection Observer API
