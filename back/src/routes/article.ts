import { Router } from 'express'

import * as controllerArticle from '../controllers/article'
import * as middlewareAuth from '../middlewares/auth'
import upload from '../middlewares/upload'

const router = Router()

// ====================
// Public
// ====================

// 公開文章列表
// 只回傳 approved
router.get('/', controllerArticle.get)

// ====================
// Admin
// ====================

// Admin 文章列表
// 必須放在 /:slug 前面
router.get('/admin', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.getAll)

// Admin 審核文章
router.patch(
  '/:id/status',
  middlewareAuth.jwt,
  middlewareAuth.admin,
  controllerArticle.updateStatus,
)

// ====================
// Member
// ====================

// 登入會員發表文章
// Backend 強制 status = pending
router.post('/', middlewareAuth.jwt, upload, controllerArticle.create)

// 登入會員修改文章
// 修改後重新進入 pending
router.patch('/:id', middlewareAuth.jwt, upload, controllerArticle.update)

// ====================
// Admin
// ====================

// Admin 刪除文章
router.delete('/:id', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.remove)

router.get('/me', middlewareAuth.jwt, controllerArticle.getMine)

// ====================
// Public Detail
// ====================

// 放在最後，避免 /admin 被當成 slug
router.get('/:slug', controllerArticle.getBySlug)

export default router
