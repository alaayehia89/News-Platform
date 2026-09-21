/**
 * الملف الجافاسكربت الرئيسي للمنصة الإخبارية
 */

// =====================================================
// 1. الثوابت والإعدادات العامة
// =====================================================
const API_BASE_URL = 'http://localhost:3000/api/v1';
let currentUser = null;

// =====================================================
// 2. عند تحميل الصفحة
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // تحديث التاريخ
    updateDate();
    
    // التحقق من حالة المستخدم
    checkAuthStatus();
    
    // إعداد القائمة المحمولة
    setupMobileMenu();
    
    // تحميل الأخبار العاجلة
    loadBreakingNews();
    
    // تحميل المقالات المميزة
    loadFeaturedArticles();
    
    // تحميل آخر الأخبار
    loadLatestNews();
    
    // تحميل الأكثر قراءة
    loadMostRead();
});

// =====================================================
// 3. دوال التاريخ والوقت
// =====================================================
function updateDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('ar-SA', options);
    }
}

// =====================================================
// 4. إدارة المصادقة والمستخدمين
// =====================================================
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            updateUIForLoggedInUser(currentUser);
        } catch (error) {
            console.error('خطأ في قراءة بيانات المستخدم:', error);
            logout();
        }
    }
}

function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const userMenu = document.querySelector('.user-menu');
    
    if (loginBtn && registerBtn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
    }
    
    if (userMenu) {
        userMenu.style.display = 'flex';
        userMenu.innerHTML = `
            <span class="user-name">${user.full_name}</span>
            <div class="user-dropdown">
                <a href="pages/profile.html">الملف الشخصي</a>
                <a href="pages/dashboard.html">لوحة التحكم</a>
                <button onclick="logout()" class="btn-logout">تسجيل الخروج</button>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.reload();
}

// =====================================================
// 5. دوال جلب البيانات من الـ API
// =====================================================
async function fetchFromAPI(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'حدث خطأ غير متوقع');
        }
        
        return await response.json();
    } catch (error) {
        console.error('خطأ في الاتصال بالـ API:', error);
        throw error;
    }
}

// =====================================================
// 6. تحميل الأخبار العاجلة
// =====================================================
async function loadBreakingNews() {
    const tickerElement = document.querySelector('.ticker-content');
    if (!tickerElement) return;
    
    try {
        // ملاحظة: نحتاج لإضافة endpoint للأخبار العاجلة في الـ Backend
        // حالياً نستخدم بيانات تجريبية
        const breakingNews = [
            { title: 'عاجل: خبر عاجل مهم جداً يتعلق بالشأن العام', article_id: 1 },
            { title: 'تطورات جديدة في مجال التكنولوجيا والذكاء الاصطناعي', article_id: 2 },
            { title: 'نتائج مباراة كرة القدم الكبرى', article_id: 3 }
        ];
        
        tickerElement.innerHTML = breakingNews.map(news => 
            `<a href="article.html?id=${news.article_id}">${news.title}</a>`
        ).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل الأخبار العاجلة:', error);
    }
}

// =====================================================
// 7. تحميل المقالات المميزة
// =====================================================
async function loadFeaturedArticles() {
    const featuredGrid = document.querySelector('.featured-grid');
    if (!featuredGrid) return;
    
    try {
        const data = await fetchFromAPI('/articles?featured=true&limit=3');
        
        if (data.articles && data.articles.length > 0) {
            const [main, ...sub] = data.articles;
            
            featuredGrid.innerHTML = `
                <div class="featured-main">
                    <a href="article.html?id=${main.article_id}">
                        <img src="${main.image_url || 'assets/images/placeholder.jpg'}" alt="${main.title}">
                        <div class="featured-overlay">
                            <h2>${main.title}</h2>
                            <p>${main.summary || ''}</p>
                        </div>
                    </a>
                </div>
                <div class="featured-sub">
                    ${sub.map(article => `
                        <div class="featured-card">
                            <a href="article.html?id=${article.article_id}">
                                <img src="${article.image_url || 'assets/images/placeholder.jpg'}" alt="${article.title}">
                                <div class="featured-card-content">
                                    <h3>${article.title}</h3>
                                    <p>${article.summary || ''}</p>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('خطأ في تحميل المقالات المميزة:', error);
        // عرض محتوى افتراضي في حالة الخطأ
        featuredGrid.innerHTML = getPlaceholderFeatured();
    }
}

function getPlaceholderFeatured() {
    return `
        <div class="featured-main">
            <a href="#">
                <img src="https://via.placeholder.com/800x500" alt="صورة افتراضية">
                <div class="featured-overlay">
                    <h2>مرحباً بك في المنصة الإخبارية الشاملة</h2>
                    <p>تابع أحدث الأخبار والتغطيات الحصرية على مدار الساعة</p>
                </div>
            </a>
        </div>
        <div class="featured-sub">
            <div class="featured-card">
                <a href="#">
                    <img src="https://via.placeholder.com/400x200" alt="صورة افتراضية">
                    <div class="featured-card-content">
                        <h3>خبر مميز أول</h3>
                        <p>ملخص الخبر المميز...</p>
                    </div>
                </a>
            </div>
            <div class="featured-card">
                <a href="#">
                    <img src="https://via.placeholder.com/400x200" alt="صورة افتراضية">
                    <div class="featured-card-content">
                        <h3>خبر مميز ثاني</h3>
                        <p>ملخص الخبر المميز...</p>
                    </div>
                </a>
            </div>
        </div>
    `;
}

// =====================================================
// 8. تحميل آخر الأخبار
// =====================================================
async function loadLatestNews() {
    const newsGrid = document.querySelector('.latest-news .news-grid');
    if (!newsGrid) return;
    
    try {
        const data = await fetchFromAPI('/articles?status=published&limit=9');
        
        if (data.articles && data.articles.length > 0) {
            newsGrid.innerHTML = data.articles.map(article => createNewsCard(article)).join('');
        }
    } catch (error) {
        console.error('خطأ في تحميل آخر الأخبار:', error);
        newsGrid.innerHTML = getPlaceholderNews(9);
    }
}

function createNewsCard(article) {
    return `
        <article class="news-card">
            <a href="article.html?id=${article.article_id}">
                <img src="${article.image_url || 'https://via.placeholder.com/400x220'}" alt="${article.title}">
                <div class="news-card-content">
                    <span class="news-card-category">${article.category_name || 'عام'}</span>
                    <h3>${article.title}</h3>
                    <p>${article.summary || ''}</p>
                    <div class="news-card-meta">
                        <span>📅 ${formatDate(article.published_at)}</span>
                        <span>👁️ ${article.views_count || 0}</span>
                    </div>
                </div>
            </a>
        </article>
    `;
}

function getPlaceholderNews(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <article class="news-card">
                <a href="#">
                    <img src="https://via.placeholder.com/400x220" alt="صورة افتراضية">
                    <div class="news-card-content">
                        <span class="news-card-category">عام</span>
                        <h3>عنوان خبر افتراضي رقم ${i + 1}</h3>
                        <p>هذا نص افتراضي لمقال إخباري...</p>
                        <div class="news-card-meta">
                            <span>📅 ${new Date().toLocaleDateString('ar-SA')}</span>
                            <span>👁️ 0</span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }
    return html;
}

// =====================================================
// 9. تحميل الأكثر قراءة
// =====================================================
async function loadMostRead() {
    const mostReadList = document.querySelector('.most-read-list');
    if (!mostReadList) return;
    
    try {
        const data = await fetchFromAPI('/articles?order=views&limit=5');
        
        if (data.articles && data.articles.length > 0) {
            mostReadList.innerHTML = data.articles.map((article, index) => `
                <div class="most-read-item">
                    <span class="most-read-number">${index + 1}</span>
                    <h4><a href="article.html?id=${article.article_id}">${article.title}</a></h4>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('خطأ في تحميل الأكثر قراءة:', error);
    }
}

// =====================================================
// 10. دوال مساعدة
// =====================================================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// =====================================================
// 11. معالجة نموذج البحث
// =====================================================
const searchForm = document.querySelector('.search-form');
if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = this.querySelector('input[type="text"]').value.trim();
        if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
}

// =====================================================
// 12. معالجة نموذج النشرة البريدية
// =====================================================
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value.trim();
        
        if (email) {
            try {
                // ملاحظة: نحتاج لإضافة endpoint للاشتراك في النشرة البريدية
                alert('شكراً لاشتراكك في نشرتنا البريدية!');
                this.reset();
            } catch (error) {
                alert('حدث خطأ أثناء الاشتراك، يرجى المحاولة لاحقاً');
            }
        }
    });
}
