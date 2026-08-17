import { isValidObjectId } from 'mongoose'

import type { Request, Response, NextFunction } from 'express'

import Shop from '../models/shop'
import ShopLike from '../models/shopLike'
import ShopFavorite from '../models/shopFavorite'

const getApprovedShop = async (shopId: string) => {
  if (!isValidObjectId(shopId)) {
    return null
  }

  return Shop.findOne({
    _id: shopId,
    status: 'approved',
  })
}

/**
 * GET /shop/:shopId/likes
 *
 * Public
 * 取得公開店家的按讚數
 */
export const getLikes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    const count = await ShopLike.countDocuments({
      shop: shop._id,
    })

    res.status(200).json({
      success: true,
      message: '取得店家按讚數成功',
      result: {
        count,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /shop/:shopId/likes/me
 *
 * Login required
 * 取得目前會員是否已按讚
 */
export const getMyLikeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    const like = await ShopLike.findOne({
      shop: shop._id,
      user: req.user._id,
    })

    res.status(200).json({
      success: true,
      message: '取得店家按讚狀態成功',
      result: {
        liked: Boolean(like),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /shop/:shopId/likes
 *
 * Login required
 * 對公開店家按讚
 */
export const addLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    await ShopLike.updateOne(
      {
        shop: shop._id,
        user: req.user._id,
      },
      {
        $setOnInsert: {
          shop: shop._id,
          user: req.user._id,
        },
      },
      {
        upsert: true,
      },
    )

    const count = await ShopLike.countDocuments({
      shop: shop._id,
    })

    res.status(200).json({
      success: true,
      message: '店家按讚成功',
      result: {
        liked: true,
        count,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /shop/:shopId/likes
 *
 * Login required
 * 取消店家按讚
 */
export const removeLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    await ShopLike.deleteOne({
      shop: shop._id,
      user: req.user._id,
    })

    const count = await ShopLike.countDocuments({
      shop: shop._id,
    })

    res.status(200).json({
      success: true,
      message: '已取消店家按讚',
      result: {
        liked: false,
        count,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /shop/:shopId/favorite
 *
 * Login required
 * 取得目前會員是否已收藏
 */
export const getMyFavoriteStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    const favorite = await ShopFavorite.findOne({
      shop: shop._id,
      user: req.user._id,
    })

    res.status(200).json({
      success: true,
      message: '取得店家收藏狀態成功',
      result: {
        favorited: Boolean(favorite),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /shop/:shopId/favorite
 *
 * Login required
 * 收藏公開店家
 */
export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    const favorite = await ShopFavorite.findOneAndUpdate(
      {
        shop: shop._id,
        user: req.user._id,
      },
      {
        $setOnInsert: {
          shop: shop._id,
          user: req.user._id,
        },
      },
      {
        upsert: true,
        new: true,
      },
    )

    res.status(200).json({
      success: true,
      message: '收藏店家成功',
      result: {
        favorited: true,
        favorite,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /shop/:shopId/favorite
 *
 * Login required
 * 取消收藏公開店家
 */
export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const shopId = String(req.params.shopId ?? '')

    const shop = await getApprovedShop(shopId)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    await ShopFavorite.deleteOne({
      shop: shop._id,
      user: req.user._id,
    })

    res.status(200).json({
      success: true,
      message: '已取消收藏店家',
      result: {
        favorited: false,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /shop/favorites/me
 *
 * Login required
 * 取得目前會員收藏的公開店家
 */
export const getMyFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const favorites = await ShopFavorite.find({
      user: req.user._id,
    })
      .populate({
        path: 'shop',
        match: {
          status: 'approved',
        },
        select: [
          'name',
          'slug',
          'description',
          'address',
          'city',
          'district',
          'phone',
          'website',
          'openingHours',
          'coverImage',
          'images',
          'status',
          'createdBy',
          'createdAt',
          'updatedAt',
        ].join(' '),
      })
      .sort({
        createdAt: -1,
      })

    /**
     * 如果收藏後店家被改回 pending、
     * rejected 或被刪除，populate 的 shop
     * 會是 null；公開收藏列表不應顯示。
     */
    const visibleFavorites = favorites.filter((favorite) => favorite.shop !== null)

    res.status(200).json({
      success: true,
      message: '取得收藏店家成功',
      result: visibleFavorites,
    })
  } catch (error) {
    next(error)
  }
}
