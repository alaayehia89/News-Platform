const db = require('../config/database');

const ArticleModel = {
    // 1. إنشاء مقال جديد مع ربط الوسوم (باستخدام Transaction)
    create: ({ title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at }, tagIds = []) => {
        const insertArticle = db.prepare(`
            INSERT INTO articles (title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertTag = db.prepare(`INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`);

        const createTransaction = db.transaction((data) => {
            const result = insertArticle.run(
                data.title, data.subtitle, data.slug, data.summary, data.content, 
                data.content_type, data.status, data.category_id, data.author_id, 
                data.source_id, data.featured_media_id, data.published_at
            );
            const articleId = result.lastInsertRowid;

            // ربط الوسوم إذا وجدت
            if (tagIds && tagIds.length > 0) {
                for (const tagId of tagIds) {
                    insertTag.run(articleId, tagId);
                }
            }
            return articleId;
        });

        return createTransaction({ title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at });
    },

    // 2. جلب مقال واحد بواسطة Slug (لصفحة التفاصيل) مع زيادة عداد المشاهدات
    findBySlug: (slug) => {
        // زيادة عداد المشاهدات
        db.prepare(`UPDATE articles SET views_count = views_count + 1 WHERE slug = ?`).run(slug);

        const stmt = db.prepare(`
            SELECT a.*, c.name as category_name, c.slug as category_slug, 
                   au.name as author_name, au.avatar_url as author_avatar, au.job_title as author_title,
                   s.name as source_name, m.file_path as featured_image
            FROM articles a
            JOIN categories c ON a.category_id = c.category_id
            JOIN authors au ON a.author_id = au.author_id
            LEFT JOIN sources s ON a.source_id = s.source_id
            LEFT JOIN media m ON a.featured_media_id = m.media_id
            WHERE a.slug = ? AND a.status = 'published'
        `);
        const article = stmt.get(slug);
        
        if (article) {
            // جلب الوسوم الخاصة بالمقال
            const tags = db.prepare(`
                SELECT t.tag_id, t.name, t.slug 
                FROM tags t 
                JOIN article_tags at ON t.tag_id = at.tag_id 
                WHERE at.article_id = ?
            `).all(article.article_id);
            article.tags = tags;
        }
        return article;
    },

    // 3. جلب قائمة المقالات (مع دعم الفلترة والصفحات)
    findAll: ({ status = 'published', category_id = null, author_id = null, limit = 10, offset = 0 }) => {
        let query = `
            SELECT a.article_id, a.title, a.slug, a.summary, a.content_type, a.status, 
                   a.is_breaking, a.is_featured, a.views_count, a.published_at, a.created_at,
                   c.name as category_name, c.slug as category_slug,
                   au.name as author_name, m.file_path as featured_image
            FROM articles a
            JOIN categories c ON a.category_id = c.category_id
            JOIN authors au ON a.author_id = au.author_id
            LEFT JOIN media m ON a.featured_media_id = m.media_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }
        if (category_id) {
            query += ` AND a.category_id = ?`;
            params.push(category_id);
        }
        if (author_id) {
            query += ` AND a.author_id = ?`;
            params.push(author_id);
        }

        query += ` ORDER BY a.published_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return db.prepare(query).all(...params);
    },

    // 4. تحديث مقال موجود
    update: (article_id, { title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at }, tagIds = []) => {
        const updateArticle = db.prepare(`
            UPDATE articles 
            SET title = ?, subtitle = ?, slug = ?, summary = ?, content = ?, content_type = ?, 
                status = ?, category_id = ?, author_id = ?, source_id = ?, featured_media_id = ?, 
                published_at = ?, updated_at = CURRENT_TIMESTAMP
            WHERE article_id = ?
        `);

        const deleteTags = db.prepare(`DELETE FROM article_tags WHERE article_id = ?`);
        const insertTag = db.prepare(`INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`);

        const updateTransaction = db.transaction((data) => {
            updateArticle.run(
                data.title, data.subtitle, data.slug, data.summary, data.content, data.content_type, 
                data.status, data.category_id, data.author_id, data.source_id, data.featured_media_id, 
                data.published_at, data.article_id
            );

            // إعادة ربط الوسوم (حذف القديم وإدراج الجديد)
            deleteTags.run(data.article_id);
            if (data.tagIds && data.tagIds.length > 0) {
                for (const tagId of data.tagIds) {
                    insertTag.run(data.article_id, tagId);
                }
            }
        });

        return updateTransaction({ title, subtitle, slug, summary, content, content_type, status, category_id, author_id, source_id, featured_media_id, published_at, article_id, tagIds });
    },

    // 5. حذف مقال
    delete: (article_id) => {
        return db.prepare(`DELETE FROM articles WHERE article_id = ?`).run(article_id);
    },

    // 6. جلب الأخبار العاجلة النشطة
    getBreakingNews: () => {
        return db.prepare(`
            SELECT bn.breaking_id, bn.title, bn.article_id, a.slug 
            FROM breaking_news bn
            LEFT JOIN articles a ON bn.article_id = a.article_id
            WHERE bn.is_active = 1 AND bn.expires_at > CURRENT_TIMESTAMP
            ORDER BY bn.created_at DESC
        `).all();
    }
};

module.exports = ArticleModel;