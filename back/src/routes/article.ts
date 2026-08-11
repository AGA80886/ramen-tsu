import { Router } from 'express'

import * as controllerArticle from '../controllers/article'
import * as middlewareAuth from '../middlewares/auth'
import upload from '../middlewares/upload'

const router = Router()

// 公開文章列表
router.get('/', controllerArticle.get)

// Admin 文章列表
router.get('/admin', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.getAll)

// 建立文章
router.post('/', middlewareAuth.jwt, middlewareAuth.admin, upload, controllerArticle.create)

// 公開文章詳情
router.get('/:slug', controllerArticle.getBySlug)

// 修改文章
router.patch('/:id', middlewareAuth.jwt, middlewareAuth.admin, upload, controllerArticle.update)

// 刪除文章
router.delete('/:id', middlewareAuth.jwt, middlewareAuth.admin, controllerArticle.remove)

export default router
