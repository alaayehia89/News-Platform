/**
 * دالة للتحقق من صلاحيات المستخدم بناءً على دوره.
 * @param {Array} allowedRoles - مصفوفة تحتوي على أسماء الأدوار المسموح لها (مثال: ['Admin', 'Editor'])
 */
const roleCheck = (allowedRoles = []) => {
    return (req, res, next) => {
        // التأكد من أن المستخدم مسجل دخول (يتم فحصه عادةً في authMiddleware، ولكن للتأكد)
        if (!req.user) {
            return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً.' });
        }

        // إذا كانت المصفوفة فارغة، فهذا يعني أن أي مستخدم مسجل دخول مسموح له (مثل User, Editor, Admin)
        if (allowedRoles.length === 0) {
            return next();
        }

        // التحقق مما إذا كان دور المستخدم الحالي موجوداً في قائمة الأدوار المسموحة
        if (!allowedRoles.includes(req.user.roleName)) {
            return res.status(403).json({ error: 'ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء.' });
        }

        next();
    };
};

module.exports = roleCheck;