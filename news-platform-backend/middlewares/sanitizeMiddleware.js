const sanitizeHtml = require('sanitize-html');

/**
 * دالة لتنقية حقول محددة من req.body لمنع هجمات XSS.
 * @param {Array} fieldsToSanitize - مصفوفة بأسماء الحقول المراد تنقيتها (مثال: ['content', 'guest_name'])
 */
const sanitizeInput = (fieldsToSanitize = []) => {
    return (req, res, next) => {
        if (req.body) {
            fieldsToSanitize.forEach(field => {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    // إزالة جميع وسوم HTML والسماح بالنص العادي فقط
                    req.body[field] = sanitizeHtml(req.body[field], {
                        allowedTags: [], 
                        allowedAttributes: {}
                    });
                }
            });
        }
        next();
    };
};

module.exports = sanitizeInput;