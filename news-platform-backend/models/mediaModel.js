const db = require('../config/database');

const MediaModel = {
    // 1. تسجيل ملف وسائط جديد في قاعدة البيانات
    create: ({ filename, original_name, file_path, mime_type, file_size, alt_text = '', caption = '', uploaded_by }) => {
        const stmt = db.prepare(`
            INSERT INTO media (filename, original_name, file_path, mime_type, file_size, alt_text, caption, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(filename, original_name, file_path, mime_type, file_size, alt_text, caption, uploaded_by);
        return { media_id: result.lastInsertRowid, file_path };
    },

    // 2. جلب ملف وسائط بواسطة المعرف
    findById: (media_id) => {
        return db.prepare(`SELECT * FROM media WHERE media_id = ?`).get(media_id);
    },

    // 3. جلب أحدث الملفات المرفوعة (لمكتبة الوسائط في لوحة التحكم)
    getRecent: (limit = 20, offset = 0) => {
        return db.prepare(`
            SELECT * FROM media 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `).all(limit, offset);
    },

    // 4. حذف سجل الملف من قاعدة البيانات (يتم حذف الملف الفعلي من القرص في الـ Controller/Service)
    delete: (media_id) => {
        return db.prepare(`DELETE FROM media WHERE media_id = ?`).run(media_id);
    }
};

module.exports = MediaModel;