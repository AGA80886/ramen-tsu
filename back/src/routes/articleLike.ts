import { Router } from 'express'

import * as controllerArticleLike from '../controllers/articleLike'
import * as middlewareAuth from '../middlewares/auth'

const router = Router()

// Public：取得文章按讚數
router.get('/:articleId/likes', controllerArticleLike.getLikes)

// Login：取得自己是否已按讚
router.get('/:articleId/likes/me', middlewareAuth.jwt, controllerArticleLike.getMyLikeStatus)

// Login：按讚
router.post('/:articleId/likes', middlewareAuth.jwt, controllerArticleLike.addLike)

// Login：取消按讚
router.delete('/:articleId/likes', middlewareAuth.jwt, controllerArticleLike.removeLike)

export default router
