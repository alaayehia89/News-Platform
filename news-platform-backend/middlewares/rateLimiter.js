const rateLimit = require('express-rate-limit');

// 1. معدل عام للـ API (للمسارات العامة مثل جلب المقالات والتصنيفات)
const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // نافذة زمنية: 15 دقيقة
    max: 300, // حد أقصى: 300 طلب لكل IP
    message: { error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.' },
    standardHeaders: true, // إرجاع معدل الحد في ترويسة `RateLimit-*`
    legacyHeaders: false, 
});

// 2. معدل صارم لمسارات المصادقة (تسجيل الدخول/التسجيل)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 10, // 10 محاولات فقط لكل IP (لمنع تخمين كلمات المرور)
    message: { error: 'تم تجاوز عدد محاولات تسجيل الدخول، يرجى الانتظار 15 دقيقة.' },
    skipSuccessfulRequests: true, // تجاهل الطلبات الناجحة من العد
});

// 3. معدل لمسارات رفع الملفات (لتجنب إغراق الخادم بالصور/الفيديوهات)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    max: 20, // 20 عملية رفع لكل IP
    message: { error: 'تم تجاوز الحد المسموح لرفع الملفات في الساعة الواحدة.' }
});

module.exports = {
    generalApiLimiter,
    authLimiter,
    uploadLimiter
};