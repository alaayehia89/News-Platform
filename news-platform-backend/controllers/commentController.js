const CommentModel = require('../models/commentModel');

// ========================================================
// 1. إضافة تعليق جديد
// ========================================================
exports.createComment = async (req, res, next) => {
    try {
        const { article_id, parent_id, content } = req.body;
        
        // التحقق من الحقول المطلوبة
        if (!article_id || !content) {
            return res.status(400).json({ error: 'يرجى تعبئة الحقول المطلوبة.' });
        }

        // الحصول على بيانات المستخدم من الـ token (إذا كان مسجلاً)
        let user_id = null;
        let guest_name = null;
        let guest_email = null;

        if (req.user) {
            // المستخدم مسجل
            user_id = req.user.userId;
        } else {
            // ضيف (غير مسجل)
            const { guest_name: name, guest_email: email } = req.body;
            if (!name || !email) {
                return res.status(400).json({ error: 'يرجى تعبئة الاسم والبريد الإلكتروني للضيف.' });
            }
            guest_name = name;
            guest_email = email;
        }

        // إنشاء التعليق
        const commentId = CommentModel.create({
            article_id,
            user_id,
            guest_name,
            guest_email,
            parent_id: parent_id || null,
            content
        });

        res.status(201).json({
            message: 'تم إضافة التعليق بنجاح.',
            comment_id: commentId
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 2. جلب تعليقات مقال معين
// ========================================================
exports.getCommentsByArticle = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        
        const comments = CommentModel.getByArticleId(article_id);
        
        res.status(200).json({ comments });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 3. جلب جميع التعليقات (للإدارة)
// ========================================================
exports.getAllComments = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const offset = (page - 1) * limit;
        
        const comments = CommentModel.getAllForAdmin({
            status: status || null,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({ 
            comments,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 4. تحديث حالة التعليق (موافقة/رفض)
// ========================================================
exports.updateCommentStatus = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        const { status } = req.body;

        // التحقق من صحة الحالة
        const validStatuses = ['pending', 'approved', 'rejected', 'reported'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'حالة غير صالحة.' });
        }

        CommentModel.updateStatus(comment_id, status);

        res.status(200).json({ message: 'تم تحديث حالة التعليق بنجاح.' });
    } catch (error) {
        next(error);
    }
};

// ========================================================
// 5. حذف تعليق
// ========================================================
exports.deleteComment = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        
        CommentModel.delete(comment_id);
        
        res.status(200).json({ message: 'تم حذف التعليق بنجاح.' });
    } catch (error) {
        next(error);
    }
};
