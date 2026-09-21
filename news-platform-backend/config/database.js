const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// التأكد من وجود مجلد database
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './database/news_platform.db';

// إنشاء الاتصال وتفعيل وضع WAL للأداء العالي
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✅ تم الاتصال بقاعدة البيانات SQLite بنجاح (WAL Mode Enabled).');

// دالة لتنفيذ ملف schema.sql وإنشاء الجداول
const initializeDatabase = () => {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
        console.log('✅ تم التحقق من الجداول وإنشاؤها إذا لم تكن موجودة.');
    } else {
        console.warn('⚠️ تحذير: ملف schema.sql غير موجود في المسار المحدد.');
    }
};

// تنفيذ الجداول عند تشغيل الملف
initializeDatabase();

module.exports = db;