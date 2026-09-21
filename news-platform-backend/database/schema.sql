-- ========================================================
-- 1. جدول الأدوار والمستخدمين (Users & Roles)
-- ========================================================
CREATE TABLE IF NOT EXISTS roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE, 
    permissions TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- ========================================================
-- 2. جدول التصنيفات والوسوم (Categories & Tags)
-- ========================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 3. جدول المؤلفين والمصادر (Authors & Sources)
-- ========================================================
CREATE TABLE IF NOT EXISTS authors (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT NULL, 
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    job_title VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    social_links TEXT, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sources (
    source_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    website_url VARCHAR(255),
    logo_url VARCHAR(255),
    trust_rating INTEGER DEFAULT 5, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. جدول الوسائط (Media Center)
-- ========================================================
CREATE TABLE IF NOT EXISTS media (
    media_id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL, 
    alt_text VARCHAR(255),
    caption TEXT,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ========================================================
-- 5. جدول الأخبار والمقالات (Articles / News)
-- ========================================================
CREATE TABLE IF NOT EXISTS articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    slug VARCHAR(280) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    content_type VARCHAR(30) DEFAULT 'news' CHECK (content_type IN ('news', 'opinion', 'report', 'video', 'infographic', 'interview')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    category_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    source_id INTEGER DEFAULT NULL,
    featured_media_id INTEGER DEFAULT NULL,
    is_breaking BOOLEAN DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE RESTRICT,
    FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE SET NULL,
    FOREIGN KEY (featured_media_id) REFERENCES media(media_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS article_tags (
    article_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- ========================================================
-- 6. جدول التفاعلات والتعليقات (Comments & Reactions)
-- ========================================================
CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    user_id INTEGER DEFAULT NULL, 
    guest_name VARCHAR(100),
    guest_email VARCHAR(150),
    parent_id INTEGER DEFAULT NULL, 
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reactions (
    reaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    user_id INTEGER DEFAULT NULL,
    ip_address VARCHAR(45) NOT NULL, 
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'important', 'analytical')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ========================================================
-- 7. جدول المفضلة وسجل القراءة (Bookmarks & History)
-- ========================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
);

-- ========================================================
-- 8. جدول الأخبار العاجلة والإشعارات (Breaking & Notifications)
-- ========================================================
CREATE TABLE IF NOT EXISTS breaking_news (
    breaking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    article_id INTEGER DEFAULT NULL, 
    is_active BOOLEAN DEFAULT 1,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE SET NULL
);

-- ========================================================
-- 9. جدول الإعلانات وسجلات النظام (Ads & System Logs)
-- ========================================================
CREATE TABLE IF NOT EXISTS ads (
    ad_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    placement_code VARCHAR(50) NOT NULL, 
    ad_type VARCHAR(30) NOT NULL CHECK (ad_type IN ('image', 'script', 'html')),
    content TEXT NOT NULL, 
    is_active BOOLEAN DEFAULT 1,
    start_date DATETIME,
    end_date DATETIME,
    clicks_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ========================================================
-- إنشاء الفهارس لتحسين كفاءة البحث (Indexing Strategy)
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id, status);
CREATE INDEX IF NOT EXISTS idx_breaking_active ON breaking_news(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);