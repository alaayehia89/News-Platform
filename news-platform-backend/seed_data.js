const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

// الاتصال بقاعدة البيانات
const dbPath = './database/news_platform.db';
const db = new Database(dbPath);

console.log('📊 جاري إضافة بيانات تجريبية...');

try {
    // 1. إضافة تصنيفات
    const categories = [
        { name: 'سياسة', slug: 'politics', description: 'أخبار سياسية محلية وعالمية' },
        { name: 'اقتصاد', slug: 'economy', description: 'أخبار اقتصادية ومالية' },
        { name: 'رياضة', slug: 'sports', description: 'أخبار رياضية ومتابعات' },
        { name: 'تكنولوجيا', slug: 'technology', description: 'أخبار التقنية والابتكارات' },
        { name: 'ثقافة', slug: 'culture', description: 'أخبار ثقافية وأدبية' },
        { name: 'صحة', slug: 'health', description: 'أخبار صحية وطبية' },
        { name: 'منوعات', slug: 'varieties', description: 'أخبار متنوعة' }
    ];

    for (const cat of categories) {
        db.prepare(`INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)`).run(cat.name, cat.slug, cat.description);
    }
    console.log('✅ تم إضافة التصنيفات');

    // 2. إضافة مصادر أخبار
    const sources = [
        { name: 'وكالة الأنباء', slug: 'news-agency', website_url: 'https://example.com' },
        { name: 'محرر الاقتصاد', slug: 'economy-editor', website_url: 'https://example.com' }
    ];

    for (const src of sources) {
        db.prepare(`INSERT OR IGNORE INTO sources (name, slug, website_url) VALUES (?, ?, ?)`).run(src.name, src.slug, src.website_url);
    }
    console.log('✅ تم إضافة المصادر');

    // 3. إضافة مؤلفين
    const authors = [
        { name: 'أحمد محمد', slug: 'ahmed-mohamed', job_title: 'محرر سياسي' },
        { name: 'فاطمة علي', slug: 'fatima-ali', job_title: 'محررة اقتصادية' },
        { name: 'محمد سعيد', slug: 'mohamed-saeed', job_title: 'مراسل رياضي' }
    ];

    for (const author of authors) {
        db.prepare(`INSERT OR IGNORE INTO authors (name, slug, job_title) VALUES (?, ?, ?)`).run(author.name, author.slug, author.job_title);
    }
    console.log('✅ تم إضافة المؤلفين');

    // 4. إضافة مقالات تجريبية
    const articles = [
        {
            title: 'تطوير جديد في مجال الذكاء الاصطناعي يثير اهتمام العلماء',
            subtitle: 'باحثون يحققون اختراقاً مهماً في تقنيات التعلم الآلي',
            slug: 'ai-breakthrough-2025',
            summary: 'أعلن فريق من الباحثين عن تطوير نموذج جديد للذكاء الاصطناعي قادر على...',
            content: 'في تطور لافت للنظر، أعلن فريق دولي من الباحثين عن تحقيق اختراق مهم في مجال الذكاء الاصطناعي والتعلم الآلي. النموذج الجديد يتميز بقدرات استثنائية على الفهم والتحليل...',
            category_id: 4,
            author_id: 1,
            status: 'published',
            is_featured: 1,
            views_count: 1520
        },
        {
            title: 'ارتفاع أسعار النفط في الأسواق العالمية',
            subtitle: 'المحللون يتوقعون استمرار الاتجاه الصعودي',
            slug: 'oil-prices-rise-2025',
            summary: 'شهدت أسعار النفط ارتفاعاً ملحوظاً في تداولات اليوم...',
            content: 'سجلت أسعار النفط الخام ارتفاعاً بنسبة 3% في تداولات اليوم، مدفوعة بتوقعات زيادة الطلب العالمي...',
            category_id: 2,
            author_id: 2,
            status: 'published',
            is_breaking: 1,
            views_count: 2340
        },
        {
            title: 'فوز المنتخب الوطني في المباراة الودية',
            subtitle: 'أداء متميز للاعبين ونتيجة مشرفة',
            slug: 'national-team-victory-2025',
            summary: 'حقق المنتخب الوطني فوزاً مهماً في مباراته الودية...',
            content: 'تمكن المنتخب الوطني من تحقيق فوز مستحق على نظيره بنتيجة 2-0 في المباراة الودية التي جمعت بينهما...',
            category_id: 3,
            author_id: 3,
            status: 'published',
            views_count: 3200
        },
        {
            title: 'اكتشاف أثري جديد يعود لآلاف السنين',
            subtitle: 'الفريق الأثري يعثر على قطع نادرة',
            slug: 'archaeological-discovery-2025',
            summary: 'أعلنت وزارة الآثار عن اكتشاف موقع أثري جديد...',
            content: 'في إعلان مهم للقطاع السياحي والثقافي، كشفت وزارة الآثار عن العثور على موقع أثري يحتوي على قطع نادرة...',
            category_id: 5,
            author_id: 1,
            status: 'published',
            views_count: 890
        },
        {
            title: 'دراسة جديدة تكشف فوائد النظام الغذائي المتوسطي',
            subtitle: 'البحث يؤكد تأثيره الإيجابي على الصحة العامة',
            slug: 'mediterranean-diet-study-2025',
            summary: 'نشرت مجلة طبية مرموقة دراسة حول فوائد النظام الغذائي...',
            content: 'أظهرت دراسة علمية حديثة نشرت في مجلة الطب النيوانغلندية أن اتباع النظام الغذائي المتوسطي...',
            category_id: 6,
            author_id: 2,
            status: 'published',
            views_count: 1150
        },
        {
            title: 'إطلاق مبادرة خيرية لدعم التعليم في المناطق النائية',
            subtitle: 'الهدف الوصول إلى 100 ألف طالب خلال عام',
            slug: 'charity-education-initiative-2025',
            summary: 'أطلقت مؤسسة خيرية مبادرة طموحة لدعم التعليم...',
            content: 'في خطوة إنسانية مهمة، أعلنت المؤسسة الخيرية للتعليم عن إطلاق مبادرة تهدف إلى توفير الدعم التعليمي...',
            category_id: 7,
            author_id: 1,
            status: 'published',
            views_count: 670
        },
        {
            title: 'قمة دولية تناقش التغير المناخي والطاقة المتجددة',
            subtitle: 'زعماء العالم يجتمعون لوضع حلول عملية',
            slug: 'climate-summit-2025',
            summary: 'انطلقت أعمال القمة الدولية للمناخ بمشاركة واسعة...',
            content: 'بدأت اليوم أعمال القمة الدولية للتغير المناخي بحضور قادة ورؤساء أكثر من 150 دولة...',
            category_id: 1,
            author_id: 1,
            status: 'published',
            is_featured: 1,
            views_count: 4500
        },
        {
            title: 'شركة تقنية كبرى تعلن عن منتج ثوري جديد',
            subtitle: 'المنتج سيطرح في الأسواق خلال الأشهر القادمة',
            slug: 'tech-product-launch-2025',
            summary: 'كشفت شركة تقنية عالمية عن منتجها الجديد...',
            content: 'في حدث صحفي كبير، كشفت إحدى كبريات شركات التكنولوجيا عن منتجها الجديد الذي وصفته بالثوري...',
            category_id: 4,
            author_id: 1,
            status: 'published',
            views_count: 2800
        }
    ];

    for (const article of articles) {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO articles 
            (title, subtitle, slug, summary, content, category_id, author_id, status, is_featured, is_breaking, views_count, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        stmt.run(
            article.title,
            article.subtitle,
            article.slug,
            article.summary,
            article.content,
            article.category_id,
            article.author_id,
            article.status,
            article.is_featured || 0,
            article.is_breaking || 0,
            article.views_count || 0
        );
    }
    console.log('✅ تم إضافة المقالات التجريبية');

    console.log('\n🎉 اكتملت إضافة البيانات التجريبية بنجاح!');
    
} catch (error) {
    console.error('❌ خطأ:', error.message);
} finally {
    db.close();
}
