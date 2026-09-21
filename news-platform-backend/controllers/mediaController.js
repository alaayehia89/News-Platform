const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MediaModel = require('../models/mediaModel');

// ========================================================
// إعداد Multer لتخزين الملفات
// ========================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        // إنشاء المجلد إذا لم يكن موجوداً
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// فلتر للتحقق من نوع الملف
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('نوع الملف غير مدعوم.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // حد أقصى 10MB
    fileFilter: fileFilter
});

// ========================================================
// 1. رفع ملف وسائط جديد
// ========================================================
exports.uploadMedia = async (req, res, next) => {
    try {
        // التحقق من وجود ملف
        if (!req.file) {
            return res.status(400).json({ error: 'يرجى اختيار ملف للرفع.' });
        }

        const { alt_text, caption } = req.body;
        const file = req.file;

        // حساب حجم الملف بالبايت
        const fileSize = file.size;
        
        // تحديد نوع الملف MIME
        const mimeType = file.mimetype;

        // الحصول على معرف المستخدم الذي قام بالرفع (من الـ token)
        let uploaded_by = null;
        if (req.user) {
            uploaded_by = req.user.userId;
        }

        // تسجيل الملف في قاعدة البيانات
        const mediaData = {
            filename: file.filename,
            original_name: file.originalname,
            file_path: `/uploads/${file.filename}`,
            mime_type: mimeType,
            file_size: fileSize,
            alt_text: alt_text || '',
            caption: caption || '',
            uploaded_by
        };

        const result = MediaModel.create(mediaData);

        res.status(201).json({
            message: 'تم رفع الملف بنجاح.',
            media: {
                media_id: result.media_id,
                file_path: result.file_path,
                url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/uploads/${file.filename}`,
                filename: file.filename,
                original_name: file.originalname,
                mime_type: mimeType,
                file_size: fileSize
            }
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 2. جلب ملف وسائط بواسطة ID
// ========================================================
exports.getMediaById = async (req, res, next) => {
    try {
        const { media_id } = req.params;
        
        const media = MediaModel.findById(media_id);
        
        if (!media) {
            return res.status(404).json({ error: 'الملف غير موجود.' });
        }

        res.status(200).json({ media });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 3. جلب أحدث الملفات (لمكتبة الوسائط)
// ========================================================
exports.getRecentMedia = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const offset = (page - 1) * limit;
        
        const mediaFiles = MediaModel.getRecent(parseInt(limit), parseInt(offset));

        res.status(200).json({ 
            media: mediaFiles,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 4. حذف ملف وسائط
// ========================================================
exports.deleteMedia = async (req, res, next) => {
    try {
        const { media_id } = req.params;
        
        // جلب معلومات الملف لحذفه من القرص
        const media = MediaModel.findById(media_id);
        
        if (!media) {
            return res.status(404).json({ error: 'الملف غير موجود.' });
        }

        // حذف الملف الفعلي من القرص
        const filePath = path.join(__dirname, '../public', media.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // حذف السجل من قاعدة البيانات
        MediaModel.delete(media_id);

        res.status(200).json({ message: 'تم حذف الملف بنجاح.' });
    } catch (error) {
        next(error);
    }
};

// تصدير middleware الـ upload لاستخدامه في المسارات
module.exports.upload = upload;
