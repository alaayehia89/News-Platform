const CategoryModel = require('../models/categoryModel');

// ========================================================
// 1. جلب جميع التصنيفات
// ========================================================
exports.getCategories = async (req, res, next) => {
    try {
        const categories = CategoryModel.getAll();
        
        res.status(200).json({ categories });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 2. جلب تصنيف بواسطة Slug
// ========================================================
exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        
        const category = CategoryModel.findBySlug(slug);
        
        if (!category) {
            return res.status(404).json({ error: 'التصنيف غير موجود.' });
        }

        res.status(200).json({ category });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 3. إنشاء تصنيف جديد
// ========================================================
exports.createCategory = async (req, res, next) => {
    try {
        const { parent_id, name, slug, description, display_order } = req.body;

        // التحقق من الحقول المطلوبة
        if (!name || !slug) {
            return res.status(400).json({ error: 'يرجى تعبئة الحقول المطلوبة (الاسم والمعرف).' });
        }

        const categoryId = CategoryModel.create({
            parent_id: parent_id || null,
            name,
            slug,
            description: description || '',
            display_order: display_order || 0
        });

        res.status(201).json({
            message: 'تم إنشاء التصنيف بنجاح.',
            category_id: categoryId
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 4. جلب جميع الوسوم
// ========================================================
exports.getTags = async (req, res, next) => {
    try {
        const tags = CategoryModel.getAllTags();
        
        res.status(200).json({ tags });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 5. إنشاء وسم جديد
// ========================================================
exports.createTag = async (req, res, next) => {
    try {
        const { name, slug } = req.body;

        // التحقق من الحقول المطلوبة
        if (!name || !slug) {
            return res.status(400).json({ error: 'يرجى تعبئة الحقول المطلوبة (الاسم والمعرف).' });
        }

        // التحقق مما إذا كان الوسم موجوداً مسبقاً
        const existingTag = CategoryModel.findTagById(slug); // ملاحظة: تحتاج لتعديل الدالة للبحث بالـ slug
        
        if (existingTag) {
            return res.status(409).json({ error: 'الوسم موجود مسبقاً.' });
        }

        // استخدام getOrCreateTag لإنشاء الوسم
        const tagId = CategoryModel.getOrCreateTag(name, slug);

        res.status(201).json({
            message: 'تم إنشاء الوسم بنجاح.',
            tag_id: tagId
        });
    } catch (error) {
        next(error);
    }
};
