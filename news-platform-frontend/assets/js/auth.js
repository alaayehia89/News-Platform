/**
 * ملف الجافاسكربت الخاص بصفحات المصادقة (تسجيل الدخول والتسجيل)
 */

// =====================================================
// 1. الثوابت والإعدادات
// =====================================================
const API_BASE_URL = 'http://localhost:3000/api/v1';

// =====================================================
// 2. دوال مساعدة
// =====================================================

/**
 * إظهار/إخفاء كلمة المرور
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

/**
 * عرض رسالة تنبيه
 */
function showAlert(message, type = 'error') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : '⚠️'}</span>
        <span>${message}</span>
    `;
    
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    // إخفاء الرسالة بعد 5 ثواني
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * التحقق من صحة كلمات المرور
 */
function validatePasswords(password, confirmPassword) {
    if (password.length < 8) {
        return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
    }
    
    if (password !== confirmPassword) {
        return { valid: false, message: 'كلمات المرور غير متطابقة' };
    }
    
    return { valid: true };
}

/**
 * حفظ بيانات المستخدم والتوكن
 */
function saveAuthData(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * توجيه المستخدم للصفحة المناسبة
 */
function redirectUser(userRole) {
    // إذا كان المستخدم مسؤول أو محرر، نوجهه للوحة التحكم
    if (userRole === 'Admin' || userRole === 'Editor') {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = '../index.html';
    }
}

// =====================================================
// 3. معالجة نموذج تسجيل الدخول
// =====================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // تعطيل الزر أثناء المعالجة
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري تسجيل الدخول...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // حفظ البيانات
                saveAuthData(data.token, data.user);
                
                // إظهار رسالة نجاح
                showAlert('تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success');
                
                // التوجيه بعد ثانية
                setTimeout(() => {
                    redirectUser(data.user.role_name);
                }, 1000);
            } else {
                showAlert(data.error || 'حدث خطأ أثناء تسجيل الدخول', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'تسجيل الدخول';
            }
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            showAlert('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'تسجيل الدخول';
        }
    });
}

// =====================================================
// 4. معالجة نموذج التسجيل
// =====================================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const full_name = document.getElementById('full_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm_password').value;
        const terms = document.getElementById('terms').checked;
        
        // التحقق من الموافقة على الشروط
        if (!terms) {
            showAlert('يجب الموافقة على الشروط والأحكام', 'warning');
            return;
        }
        
        // التحقق من كلمات المرور
        const passwordValidation = validatePasswords(password, confirm_password);
        if (!passwordValidation.valid) {
            showAlert(passwordValidation.message, 'warning');
            return;
        }
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري إنشاء الحساب...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ full_name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // إظهار رسالة نجاح
                showAlert('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...', 'success');
                
                // تسجيل الدخول تلقائياً
                setTimeout(async () => {
                    try {
                        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password })
                        });
                        
                        const loginData = await loginResponse.json();
                        if (loginResponse.ok) {
                            saveAuthData(loginData.token, loginData.user);
                            window.location.href = '../index.html';
                        }
                    } catch (loginError) {
                        console.error('خطأ في تسجيل الدخول التلقائي:', loginError);
                        window.location.href = 'login.html';
                    }
                }, 1000);
            } else {
                showAlert(data.error || 'حدث خطأ أثناء إنشاء الحساب', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'إنشاء الحساب';
            }
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            showAlert('تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'إنشاء الحساب';
        }
    });
}

// =====================================================
// 5. التحقق من حالة المستخدم عند تحميل الصفحة
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    // إذا كان المستخدم مسجل دخول بالفعل ونحاول الوصول لصفحة تسجيل الدخول
    if ((token && user) && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        const currentUser = JSON.parse(user);
        // توجيه المستخدم للصفحة المناسبة
        redirectUser(currentUser.role_name);
    }
});
