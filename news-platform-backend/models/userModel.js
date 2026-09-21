const db = require('../config/database');

// ========================================================
// دالة لضمان وجود الأدوار الأساسية في النظام (Seed Roles)
// ========================================================
const ensureDefaultRoles = () => {
    const roles = [
        { name: 'Admin', permissions: '["all"]' },
        { name: 'Editor', permissions: '["articles:write", "articles:publish", "comments:moderate"]' },
        { name: 'Reporter', permissions: '["articles:write", "media:upload"]' },
        { name: 'User', permissions: '["comments:write", "bookmarks:manage"]' }
    ];
    
    // استخدام INSERT OR IGNORE لتجنب التكرار إذا كانت الأدوار موجودة مسبقاً
    const insertStmt = db.prepare('INSERT OR IGNORE INTO roles (role_name, permissions) VALUES (?, ?)');
    
    const insertMany = db.transaction((roles) => {
        for (const role of roles) {
            insertStmt.run(role.name, role.permissions);
        }
    });
    
    insertMany(roles);
    console.log('✅ تم التأكد من وجود الأدوار الأساسية (Admin, Editor, Reporter, User) في قاعدة البيانات.');
};

// تشغيل الدالة عند تحميل الملف لأول مرة
ensureDefaultRoles();

// ========================================================
// نموذج المستخدمين (User Model)
// ========================================================
const UserModel = {
    // 1. إنشاء مستخدم جديد
    create: ({ role_id, full_name, email, password_hash, avatar_url = null, bio = null }) => {
        const stmt = db.prepare(`
            INSERT INTO users (role_id, full_name, email, password_hash, avatar_url, bio)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(role_id, full_name, email, password_hash, avatar_url, bio);
        return { user_id: result.lastInsertRowid, full_name, email };
    },

    // 2. البحث عن مستخدم بواسطة البريد الإلكتروني (مهم جداً لتسجيل الدخول)
    findByEmail: (email) => {
        const stmt = db.prepare(`
            SELECT u.user_id, u.role_id, u.full_name, u.email, u.password_hash, u.status, r.role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.email = ?
        `);
        return stmt.get(email);
    },

    // 3. البحث عن مستخدم بواسطة المعرف (مهم للـ Auth Middleware)
    findById: (user_id) => {
        const stmt = db.prepare(`
            SELECT u.user_id, u.full_name, u.email, u.avatar_url, u.bio, u.status, r.role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `);
        return stmt.get(user_id);
    },

    // 4. تحديث بيانات الملف الشخصي
    updateProfile: (user_id, { full_name, avatar_url, bio }) => {
        const stmt = db.prepare(`
            UPDATE users 
            SET full_name = ?, avatar_url = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `);
        return stmt.run(full_name, avatar_url, bio, user_id);
    },

    // 5. تحديث حالة المستخدم (تفعيل/إيقاف)
    updateStatus: (user_id, status) => {
        const stmt = db.prepare(`UPDATE users SET status = ? WHERE user_id = ?`);
        return stmt.run(status, user_id);
    },

    // 6. تحديث وقت آخر تسجيل دخول
    updateLastLogin: (user_id) => {
        const stmt = db.prepare(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`);
        return stmt.run(user_id);
    },

    // 7. جلب معرف الدور بناءً على اسمه (مفيد عند التسجيل)
    getRoleIdByName: (role_name) => {
        const stmt = db.prepare(`SELECT role_id FROM roles WHERE role_name = ?`);
        const role = stmt.get(role_name);
        return role ? role.role_id : null;
    }
};

module.exports = UserModel;
