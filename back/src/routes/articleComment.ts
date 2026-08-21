import { Router } from 'express'

import * as controllerArticleComment from '../controllers/articleComment'
import * as middlewareAuth from '../middlewares/auth'

const router = Router()

// 取得指定文章留言
// Public
router.get('/:articleId/comments', controllerArticleComment.getComments)

// 建立留言
// Login required
router.post('/:articleId/comments', middlewareAuth.jwt, controllerArticleComment.createComment)

// 刪除留言
// 留言本人或 Admin
router.delete(
  '/:articleId/comments/:commentId',
  middlewareAuth.jwt,
  controllerArticleComment.deleteComment,
)

export default router
