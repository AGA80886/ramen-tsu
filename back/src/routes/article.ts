import { Router } from 'express'

import * as controllerArticle from '../controllers/article'
import * as middlewareAuth from '../middlewares/auth'

const router = Router()

// 公開文章列表
router.get('/', controllerArticle.get)

// 管理員取得全部文章
// 必須放在 /:slug 前面
router.get('/admin', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.getAll)

// 公開文章詳情
router.get('/:slug', controllerArticle.getBySlug)

// 管理員建立文章
router.post('/', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.create)

// 管理員修改文章
router.patch('/:id', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.update)

// 管理員刪除文章
router.delete('/:id', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.remove)

export default router
