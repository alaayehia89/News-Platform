const db = require('../config/database');

const CommentModel = {
    // 1. إضافة تعليق جديد
    create: ({ article_id, user_id = null, guest_name = null, guest_email = null, parent_id = null, content }) => {
        const stmt = db.prepare(`
            INSERT INTO comments (article_id, user_id, guest_name, guest_email, parent_id, content)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(article_id, user_id, guest_name, guest_email, parent_id, content);
        return result.lastInsertRowid;
    },

    // 2. جلب التعليقات المعتمدة لمقال معين (مع بيانات المستخدم إذا كان مسجلاً)
    getByArticleId: (article_id) => {
        const stmt = db.prepare(`
            SELECT c.comment_id, c.parent_id, c.content, c.created_at, c.guest_name,
                   u.full_name as user_name, u.avatar_url as user_avatar
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.user_id
            WHERE c.article_id = ? AND c.status = 'approved'
            ORDER BY c.created_at ASC
        `);
        return stmt.all(article_id);
    },

    // 3. جلب جميع التعليقات (للوحة التحكم - تشمل المعلقة والمرفوضة)
    getAllForAdmin: ({ status = null, limit = 20, offset = 0 }) => {
        let query = `
            SELECT c.comment_id, c.article_id, c.content, c.status, c.created_at, c.guest_name,
                   a.title as article_title, u.full_name as user_name
            FROM comments c
            JOIN articles a ON c.article_id = a.article_id
            LEFT JOIN users u ON c.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND c.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        return db.prepare(query).all(...params);
    },

    // 4. تحديث حالة التعليق (موافقة، رفض، إبلاغ)
    updateStatus: (comment_id, status) => {
        return db.prepare(`UPDATE comments SET status = ? WHERE comment_id = ?`).run(status, comment_id);
    },

    // 5. حذف تعليق
    delete: (comment_id) => {
        return db.prepare(`DELETE FROM comments WHERE comment_id = ?`).run(comment_id);
    }
};

module.exports = CommentModel;