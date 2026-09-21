const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// ========================================================
// 1. تسجيل مستخدم جديد (Register)
// ========================================================
exports.register = async (req, res, next) => {
    try {
        const { full_name, email, password } = req.body;

        // التحقق من وجود الحقول المطلوبة
        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة.' });
        }

        // التحقق مما إذا كان البريد الإلكتروني مسجلاً مسبقاً
        const existingUser = UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'البريد الإلكتروني مسجل مسبقاً.' });
        }

        // تشفير كلمة المرور
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // الحصول على معرف دور "User" الافتراضي
        const role_id = UserModel.getRoleIdByName('User');
        if (!role_id) {
            return res.status(500).json({ error: 'خطأ في تكوين الأدوار في قاعدة البيانات.' });
        }

        // إنشاء المستخدم في قاعدة البيانات
        const newUser = UserModel.create({
            role_id,
            full_name,
            email,
            password_hash
        });

        // إرجاع استجابة ناجحة (بدون كلمة المرور)
        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح.',
            user: {
                user_id: newUser.user_id,
                full_name: newUser.full_name,
                email: newUser.email
            }
        });
    } catch (error) {
        next(error); // تمرير الخطأ إلى معالج الأخطاء العام
    }
};

// ========================================================
// 2. تسجيل الدخول (Login)
// ========================================================
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // التحقق من حالة الحساب
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'الحساب معلق أو غير نشط. يرجى التواصل مع الإدارة.' });
        }

        // التحقق من صحة كلمة المرور
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // تحديث وقت آخر تسجيل دخول
        UserModel.updateLastLogin(user.user_id);

        // توليد رمز JWT
        const tokenPayload = {
            userId: user.user_id,
            roleId: user.role_id,
            roleName: user.role_name,
            email: user.email
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' }); // صالح لمدة 7 أيام

        // إرجاع الرمز وبيانات المستخدم (بدون كلمة المرور)
        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح.',
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role_name: user.role_name,
                avatar_url: user.avatar_url
            }
        });
    } catch (error) {
        next(error);
    }
};