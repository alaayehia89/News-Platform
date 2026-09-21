const db = require('../config/database');

const CategoryModel = {
    // ==================== التصنيفات (Categories) ====================
    
    // جلب جميع التصنيفات (مسطحة أو مع الأب)
    getAll: () => {
        return db.prepare(`
            SELECT category_id, parent_id, name, slug, description, display_order 
            FROM categories 
            ORDER BY display_order ASC, name ASC
        `).all();
    },

    // جلب تصنيف بواسطة Slug
    findBySlug: (slug) => {
        return db.prepare(`SELECT * FROM categories WHERE slug = ?`).get(slug);
    },

    // إنشاء تصنيف جديد
    create: ({ parent_id = null, name, slug, description = '', display_order = 0 }) => {
        const stmt = db.prepare(`
            INSERT INTO categories (parent_id, name, slug, description, display_order) 
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(parent_id, name, slug, description, display_order);
        return result.lastInsertRowid;
    },

    // ==================== الوسوم (Tags) ====================

    // جلب جميع الوسوم
    getAllTags: () => {
        return db.prepare(`SELECT * FROM tags ORDER BY name ASC`).all();
    },

    // جلب وسم بواسطة ID
    findTagById: (tag_id) => {
        return db.prepare(`SELECT * FROM tags WHERE tag_id = ?`).get(tag_id);
    },

    // إنشاء وسم جديد أو جلبه إذا كان موجوداً (مفيد جداً عند نشر مقال)
    getOrCreateTag: (name, slug) => {
        const findStmt = db.prepare(`SELECT tag_id FROM tags WHERE slug = ?`);
        let tag = findStmt.get(slug);
        
        if (tag) {
            return tag.tag_id;
        } else {
            const insertStmt = db.prepare(`INSERT INTO tags (name, slug) VALUES (?, ?)`);
            const result = insertStmt.run(name, slug);
            return result.lastInsertRowid;
        }
    }
};

module.exports = CategoryModel;