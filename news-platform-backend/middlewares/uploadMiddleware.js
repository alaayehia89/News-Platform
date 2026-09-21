const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// تحديد الامتدادات وأنواع الملفات المقبولة (MIME Types)
const ALLOWED_MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4'
};

// إعداد مساحة التخزين (Storage Engine)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // إنشاء مسار ديناميكي بناءً على السنة والشهر (YYYY/MM)
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const uploadPath = path.join(__dirname, `../public/uploads/${year}/${month}`);
        
        // التأكد من وجود المجلد وإنشائه إذا لم يكن موجوداً
        fs.mkdirSync(uploadPath, { recursive: true });
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // توليد اسم فريد للملف باستخدام UUID v4 متبوعاً بالامتداد الأصلي
        const uniqueSuffix = crypto.randomUUID();
        const ext = ALLOWED_MIME_TYPES[file.mimetype];
        cb(null, `${uniqueSuffix}.${ext}`);
    }
});

// مصفاة الملفات (File Filter) لرفض الأنواع غير المدعومة فوراً
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
        cb(null, true); // قبول الملف
    } else {
        cb(new Error('نوع الملف غير مدعوم! يسمح فقط بصيغ JPG, PNG, WEBP, MP4.'), false); // رفض الملف
    }
};

// تهيئة Multer بالإعدادات السابقة
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 15 * 1024 * 1024 // الحد الأقصى لحجم الملف: 15 ميجابايت
    }
});

module.exports = upload;