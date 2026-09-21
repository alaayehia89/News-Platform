require('dotenv').config();

// ➕ استيراد إعدادات قاعدة البيانات (سيتم إنشاء الجداول والتأكد من الأدوار تلقائياً عند التشغيل)
require('./config/database'); 

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// ➕ استيراد معالج الأخطاء العام
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================================
// 1. إعدادات الأمان والضغط والـ CORS
// ========================================================
// تعزيز ترويسات الأمان عبر Helmet
app.use(helmet());

// ضغط الاستجابات لتقليل استهلاك النطاق الترددي
app.use(compression());

// التحكم في سياسة CORS
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// ========================================================
// 2. حماية حدود الطلبات (Rate Limiting)
// ========================================================
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // نافذة 15 دقيقة
    max: 300, // حد أقصى 300 طلب لكل IP
    message: { error: 'تجاوزت الحد المسموح من الطلبات، يرجى المحاولة لاحقاً.' }
});
app.use('/api/', apiLimiter);

// ========================================================
// 3. معالجة طلبات JSON والـ URL Encoded
// ========================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================================
// 4. استضافة الملفات الثابتة (الوسائط المرفوعة)
// ========================================================
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ========================================================
// 5. مسارات الـ APIs
// ========================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/media', mediaRoutes);

// رسالة تجريبية للتأكد من عمل الخادم
app.get('/', (req, res) => {
    res.json({ message: 'مرحباً بك في الـ API الخاص بالمنصة الإخبارية الشاملة!' });
});

// ========================================================
// 6. معالج الأخطاء العام (يجب أن يكون آخر Middleware)
// ========================================================
app.use(errorHandler);

// ========================================================
// تشغيل الخادم
// ========================================================
app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على المنفذ: http://localhost:${PORT}`);
});