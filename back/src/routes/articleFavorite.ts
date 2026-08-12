import { Router } from 'express'

import * as controllerArticleFavorite from '../controllers/articleFavorite'
import * as middlewareAuth from '../middlewares/auth'

const router = Router()

// 取得目前登入會員的所有收藏文章
// Login required
router.get('/favorites/me', middlewareAuth.jwt, controllerArticleFavorite.getMyFavorites)

// 取得目前登入會員是否收藏指定文章
// Login required
router.get(
  '/:articleId/favorite',
  middlewareAuth.jwt,
  controllerArticleFavorite.getMyFavoriteStatus,
)

// 收藏文章
// Login required
router.post('/:articleId/favorite', middlewareAuth.jwt, controllerArticleFavorite.addFavorite)

// 取消收藏文章
// Login required
router.delete('/:articleId/favorite', middlewareAuth.jwt, controllerArticleFavorite.removeFavorite)

export default router
