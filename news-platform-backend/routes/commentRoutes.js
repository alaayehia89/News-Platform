const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// ========================================================
// مسارات إدارة التعليقات (Comments)
// ========================================================

// GET /api/v1/comments - جلب جميع التعليقات (للإدارة)
router.get('/', commentController.getAllComments);

// POST /api/v1/comments - إضافة تعليق جديد
router.post('/', commentController.createComment);

// GET /api/v1/comments/article/:article_id - جلب تعليقات مقال معين
router.get('/article/:article_id', commentController.getCommentsByArticle);

// PUT /api/v1/comments/:comment_id/status - تحديث حالة التعليق
router.put('/:comment_id/status', commentController.updateCommentStatus);

// DELETE /api/v1/comments/:comment_id - حذف تعليق
router.delete('/:comment_id', commentController.deleteComment);

module.exports = router;
