const ArticleModel = require('../models/articleModel');
const CategoryModel = require('../models/categoryModel');

// ========================================================
// 1. إنشاء مقال جديد
// ========================================================
exports.createArticle = async (req, res, next) => {
    try {
        const { title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at, tags } = req.body;

        // التحقق من الحقول المطلوبة
        if (!title || !slug || !content || !category_id || !author_id) {
            return res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة.' });
        }

        // تحويل الوسوم إلى معرفات (إذا كانت أسماء)
        let tagIds = [];
        if (tags && Array.isArray(tags)) {
            for (const tag of tags) {
                if (typeof tag === 'string') {
                    // إنشاء أو جلب الوسم
                    const tagId = CategoryModel.getOrCreateTag(tag, tag.toLowerCase().replace(/\s+/g, '-'));
                    tagIds.push(tagId);
                } else if (typeof tag === 'number') {
                    tagIds.push(tag);
                }
            }
        }

        // إنشاء المقال
        const articleId = ArticleModel.create({
            title, subtitle, slug, summary, content, content_type, status, 
            category_id, author_id, source_id, featured_media_id, published_at
        }, tagIds);

        res.status(201).json({
            message: 'تم إنشاء المقال بنجاح.',
            article_id: articleId
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 2. جلب مقال بواسطة Slug
// ========================================================
exports.getArticleBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        
        const article = ArticleModel.findBySlug(slug);
        
        if (!article) {
            return res.status(404).json({ error: 'المقال غير موجود.' });
        }

        res.status(200).json({ article });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 3. جلب قائمة المقالات
// ========================================================
exports.getArticles = async (req, res, next) => {
    try {
        const { status, category_id, author_id, page = 1, limit = 10 } = req.query;
        
        const offset = (page - 1) * limit;
        
        const articles = ArticleModel.findAll({
            status: status || 'published',
            category_id: category_id ? parseInt(category_id) : null,
            author_id: author_id ? parseInt(author_id) : null,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({ 
            articles,
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
// 4. تحديث مقال موجود
// ========================================================
exports.updateArticle = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const { title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at, tags } = req.body;

        // تحويل الوسوم إلى معرفات
        let tagIds = [];
        if (tags && Array.isArray(tags)) {
            for (const tag of tags) {
                if (typeof tag === 'string') {
                    const tagId = CategoryModel.getOrCreateTag(tag, tag.toLowerCase().replace(/\s+/g, '-'));
                    tagIds.push(tagId);
                } else if (typeof tag === 'number') {
                    tagIds.push(tag);
                }
            }
        }

        // تحديث المقال
        ArticleModel.update(
            article_id,
            { title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at },
            tagIds
        );

        res.status(200).json({ message: 'تم تحديث المقال بنجاح.' });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 5. حذف مقال
// ========================================================
exports.deleteArticle = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        
        ArticleModel.delete(article_id);
        
        res.status(200).json({ message: 'تم حذف المقال بنجاح.' });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 6. جلب الأخبار العاجلة
// ========================================================
exports.getBreakingNews = async (req, res, next) => {
    try {
        const breakingNews = ArticleModel.getBreakingNews();
        
        res.status(200).json({ breaking_news: breakingNews });
    } catch (error) {
        next(error);
    }
};
