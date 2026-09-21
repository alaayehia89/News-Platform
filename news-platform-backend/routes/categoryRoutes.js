const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// ========================================================
// مسارات إدارة التصنيفات (Categories)
// ========================================================

// GET /api/v1/categories - جلب جميع التصنيفات
router.get('/', categoryController.getCategories);

// POST /api/v1/categories - إنشاء تصنيف جديد
router.post('/', categoryController.createCategory);

// GET /api/v1/categories/:slug - جلب تصنيف بواسطة Slug
router.get('/:slug', categoryController.getCategoryBySlug);

// ========================================================
// مسارات إدارة الوسوم (Tags)
// ========================================================

// GET /api/v1/tags - جلب جميع الوسوم
router.get('/tags', categoryController.getTags);

// POST /api/v1/tags - إنشاء وسم جديد
router.post('/tags', categoryController.createTag);

module.exports = router;
