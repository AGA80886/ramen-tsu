import { Router } from 'express'

import * as controllerShop from '../controllers/shop'
import * as controllerShopReaction from '../controllers/shopReaction'

import * as middlewareAuth from '../middlewares/auth'

import upload from '../middlewares/upload'

const router = Router()

/**
 * Public
 */

// 取得已通過審核店家列表
router.get('/', controllerShop.getShops)

/**
 * Login required
 *
 * 注意：
 * 這些固定路徑要放在 /:slug 前面，
 * 避免未來路由擴充時產生衝突。
 */

// 取得目前會員自己的店家
router.get('/me', middlewareAuth.jwt, controllerShop.getMyShops)

// 取得目前會員自己的單一店家
router.get('/me/:id', middlewareAuth.jwt, controllerShop.getMyShop)

// 取得目前會員收藏的公開店家
router.get('/favorites/me', middlewareAuth.jwt, controllerShopReaction.getMyFavorites)

/**
 * Shop Reaction
 */

// 公開取得店家按讚數
router.get('/:shopId/likes', controllerShopReaction.getLikes)

// 取得目前會員是否已按讚
router.get('/:shopId/likes/me', middlewareAuth.jwt, controllerShopReaction.getMyLikeStatus)

// 店家按讚
router.post('/:shopId/likes', middlewareAuth.jwt, controllerShopReaction.addLike)

// 取消店家按讚
router.delete('/:shopId/likes', middlewareAuth.jwt, controllerShopReaction.removeLike)

// 取得目前會員是否已收藏
router.get('/:shopId/favorite', middlewareAuth.jwt, controllerShopReaction.getMyFavoriteStatus)

// 收藏店家
router.post('/:shopId/favorite', middlewareAuth.jwt, controllerShopReaction.addFavorite)

// 取消收藏店家
router.delete('/:shopId/favorite', middlewareAuth.jwt, controllerShopReaction.removeFavorite)

/**
 * Public Shop Detail
 *
 * 這條動態 slug route 放在固定路徑與
 * reaction routes 後面。
 */

// 取得單一已通過審核店家
router.get('/:slug', controllerShop.getShop)

/**
 * Shop CRUD
 */

// 建立店家
router.post('/', middlewareAuth.jwt, upload, controllerShop.createShop)

// 修改自己的店家
router.patch('/:id', middlewareAuth.jwt, upload, controllerShop.updateShop)

// 刪除自己的店家
router.delete('/:id', middlewareAuth.jwt, controllerShop.deleteShop)

export default router
