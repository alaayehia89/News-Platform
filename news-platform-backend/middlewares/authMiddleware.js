const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. استخراج التوكن من ترويسة Authorization (الصيغة المتوقعة: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'الوصول مرفوض. يرجى تسجيل الدخول أولاً.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. التحقق من صحة التوكن وفك تشفيره باستخدام المفتاح السري
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. إرفاق بيانات المستخدم في كائن الطلب (req) لاستخدامها في الخطوات التالية
        // ملاحظة: سنقوم بتضمين roleName داخل الـ Payload عند تسجيل الدخول لاحقاً
        req.user = {
            userId: decoded.userId,
            roleId: decoded.roleId,
            roleName: decoded.roleName, 
            email: decoded.email
        };

        // الانتقال إلى الخطوة التالية (Controller أو Middleware آخر)
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'انتهت صلاحية جلسة الدخول، يرجى تسجيل الدخول مرة أخرى.' });
        }
        return res.status(403).json({ error: 'التوكن غير صالح أو تم التلاعب به.' });
    }
};

module.exports = authMiddleware;