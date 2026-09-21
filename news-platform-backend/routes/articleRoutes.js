const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// ========================================================
// مسارات إدارة المقالات (Articles)
// ========================================================

// GET /api/v1/articles - جلب قائمة المقالات
router.get('/', articleController.getArticles);

// GET /api/v1/articles/breaking - جلب الأخبار العاجلة
router.get('/breaking', articleController.getBreakingNews);

// POST /api/v1/articles - إنشاء مقال جديد
router.post('/', articleController.createArticle);

// GET /api/v1/articles/:slug - جلب مقال بواسطة Slug
router.get('/:slug', articleController.getArticleBySlug);

// PUT /api/v1/articles/:article_id - تحديث مقال
router.put('/:article_id', articleController.updateArticle);

// DELETE /api/v1/articles/:article_id - حذف مقال
router.delete('/:article_id', articleController.deleteArticle);

module.exports = router;
