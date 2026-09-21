const errorHandler = (err, req, res, next) => {
    // تسجيل الخطأ في الـ Console (يمكن لاحقاً توجيهه إلى ملف سجلات)
    console.error(`[Error] ${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // 1. معالجة أخطاء Multer (رفع الملفات)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'حجم الملف يتجاوز الحد المسموح (15 ميجابايت).' });
    }
    if (err.message && err.message.includes('نوع الملف غير مدعوم')) {
        return res.status(400).json({ error: err.message });
    }

    // 2. معالجة أخطاء JSON Web Token (JWT)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'توكن غير صالح.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'انتهت صلاحية التوكن، يرجى تسجيل الدخول مرة أخرى.' });
    }

    // 3. معالجة أخطاء قاعدة البيانات (SQLite Constraints)
    if (err.code === 'SQLITE_CONSTRAINT') {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'البيانات المدخلة موجودة مسبقاً (مثل البريد الإلكتروني أو الاسم المستعار).' });
        }
        return res.status(400).json({ error: 'خطأ في تكامل قاعدة البيانات.' });
    }

    // 4. الرد النهائي مع رسالة الخطأ
    res.status(err.status || 500).json({
        error: err.message || 'حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً.',
        // في بيئة التطوير فقط، نعيد تفاصيل الخطأ (Stack) لتسهيل التصحيح
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;