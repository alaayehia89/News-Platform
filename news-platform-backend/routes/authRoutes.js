const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

// تطبيق حدود الطلبات الصارمة على مسارات المصادقة لمنع هجمات التخمين
router.use(authLimiter);

// مسار تسجيل مستخدم جديد
router.post('/register', authController.register);

// مسار تسجيل الدخول
router.post('/login', authController.login);

module.exports = router;