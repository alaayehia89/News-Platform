const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

// ========================================================
// مسارات إدارة الوسائط (Media)
// ========================================================

// POST /api/v1/media/upload - رفع ملف وسائط جديد
router.post('/upload', mediaController.upload.single('file'), mediaController.uploadMedia);

// GET /api/v1/media - جلب أحدث الملفات (لمكتبة الوسائط)
router.get('/', mediaController.getRecentMedia);

// GET /api/v1/media/:media_id - جلب ملف وسائط بواسطة ID
router.get('/:media_id', mediaController.getMediaById);

// DELETE /api/v1/media/:media_id - حذف ملف وسائط
router.delete('/:media_id', mediaController.deleteMedia);

module.exports = router;
