import type { Request, Response, NextFunction } from 'express'

import Shop, { type IShopLocation } from '../models/shop'

/**
 * GET /shop
 *
 * 公開取得已通過審核的店家列表
 */
export const getShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shops = await Shop.find({
      status: 'approved',
    })
      .populate('createdBy', 'account nickname avatar')
      .sort({
        createdAt: -1,
      })

    res.status(200).json({
      success: true,
      message: '取得店家列表成功',
      result: shops,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /shop/:slug
 *
 * 公開取得單一已通過審核的店家
 */
export const getShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = String(req.params.slug ?? '')

    if (!slug) {
      res.status(400).json({
        success: false,
        message: '缺少店家 slug',
      })
      return
    }

    const shop = await Shop.findOne({
      slug,
      status: 'approved',
    }).populate('createdBy', 'account nickname avatar')

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '店家不存在、尚未通過審核，或已被下架',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: '取得店家資料成功',
      result: shop,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /shop
 *
 * 建立店家
 * Login required
 */
export const createShop = async (
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

    const {
      name,
      slug,
      description,
      address,
      city,
      district,
      phone,
      website,
      openingHours,
      coverImage,
      images,
      location,
    } = req.body

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location

    if (parsedLocation !== undefined && !isValidShopLocation(parsedLocation)) {
      res.status(400).json({
        success: false,
        message: '店家座標格式錯誤',
      })
      return
    }

    const existingShop = await Shop.findOne({
      slug,
    })

    if (existingShop) {
      res.status(409).json({
        success: false,
        message: '店家 slug 已存在',
      })
      return
    }

    const shop = await Shop.create({
      name,
      slug,
      description,
      address,
      city,
      district,

      phone: phone ?? '',
      website: website ?? '',
      openingHours: openingHours ?? '',

      coverImage: req.file?.path ?? coverImage ?? '',

      images: Array.isArray(images) ? images : typeof images === 'string' ? JSON.parse(images) : [],

      ...(parsedLocation !== undefined ? { location: parsedLocation } : {}),

      // 第一版建立後先進入待審核
      status: 'pending',

      createdBy: req.user._id,
    })

    res.status(201).json({
      success: true,
      message: '建立店家成功，等待審核',
      result: shop,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /shop/:id
 *
 * 修改自己的店家資料
 * Login required
 */
export const updateShop = async (
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

    const id = String(req.params.id ?? '')

    if (!id) {
      res.status(400).json({
        success: false,
        message: '缺少店家 ID',
      })
      return
    }

    const shop = await Shop.findById(id)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '找不到店家',
      })
      return
    }

    // 後面維持原本程式

    /**
     * Ownership
     *
     * 一般會員只能修改自己建立的店家。
     */
    if (shop.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: '沒有權限修改此店家',
      })
      return
    }

    const {
      name,
      slug,
      description,
      address,
      city,
      district,
      phone,
      website,
      openingHours,
      coverImage,
      images,
      location,
    } = req.body

    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location

    if (parsedLocation !== undefined && !isValidShopLocation(parsedLocation)) {
      res.status(400).json({
        success: false,
        message: '店家座標格式錯誤',
      })
      return
    }

    /**
     * 如果 slug 有修改，
     * 先確認新的 slug 沒被其他店家使用。
     */
    if (slug && slug !== shop.slug) {
      const existingShop = await Shop.findOne({
        slug,
        _id: {
          $ne: shop._id,
        },
      })

      if (existingShop) {
        res.status(409).json({
          success: false,
          message: '店家 slug 已存在',
        })
        return
      }

      shop.slug = slug
    }

    if (name !== undefined) {
      shop.name = name
    }

    if (description !== undefined) {
      shop.description = description
    }

    if (address !== undefined) {
      shop.address = address
    }

    if (city !== undefined) {
      shop.city = city
    }

    if (district !== undefined) {
      shop.district = district
    }

    if (phone !== undefined) {
      shop.phone = phone
    }

    if (website !== undefined) {
      shop.website = website
    }

    if (openingHours !== undefined) {
      shop.openingHours = openingHours
    }

    if (req.file?.path) {
      shop.coverImage = req.file.path
    } else if (coverImage !== undefined) {
      shop.coverImage = coverImage
    }

    if (images !== undefined) {
      shop.images = Array.isArray(images)
        ? images
        : typeof images === 'string'
          ? JSON.parse(images)
          : []
    }

    if (parsedLocation !== undefined) {
      shop.location = parsedLocation
    }

    /**
     * 店家資料被會員修改後重新進入審核。
     *
     * 避免 approved 店家被修改成其他內容後，
     * 直接保持公開狀態。
     */
    shop.status = 'pending'

    await shop.save()

    res.status(200).json({
      success: true,
      message: '修改店家成功，等待重新審核',
      result: shop,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /shop/:id
 *
 * 刪除自己建立的店家
 * Login required
 */
export const deleteShop = async (
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

    const id = String(req.params.id ?? '')

    if (!id) {
      res.status(400).json({
        success: false,
        message: '缺少店家 ID',
      })
      return
    }

    const shop = await Shop.findById(id)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '找不到店家',
      })
      return
    }

    /**
     * Ownership
     */
    if (shop.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: '沒有權限刪除此店家',
      })
      return
    }

    await shop.deleteOne()

    res.status(200).json({
      success: true,
      message: '刪除店家成功',
    })
  } catch (error) {
    next(error)
  }
}

export const getMyShops = async (
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

    const shops = await Shop.find({
      createdBy: req.user._id,
    }).sort({
      createdAt: -1,
    })

    res.status(200).json({
      success: true,
      message: '取得我的店家成功',
      result: shops,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /shop/me/:id
 *
 * 取得目前登入會員自己的單一店家
 * Login required
 */
export const getMyShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: '請先登入',
      })
      return
    }

    const id = String(req.params.id ?? '')

    if (!id) {
      res.status(400).json({
        success: false,
        message: '缺少店家 ID',
      })
      return
    }

    const shop = await Shop.findOne({
      _id: id,
      createdBy: req.user._id,
    })

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '找不到店家，或沒有權限查看此店家',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: '取得我的店家資料成功',
      result: shop,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /admin/shop
 *
 * Admin 取得所有店家
 *
 * 店家管理頁會顯示：
 * draft / pending / approved / rejected
 */
export const getAdminShops = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const shops = await Shop.find().populate('createdBy', 'account nickname avatar').sort({
      createdAt: -1,
    })

    res.status(200).json({
      success: true,
      message: '取得店家管理列表成功',
      result: shops,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 舊 route 相容層
 *
 * 如果目前 route 還是呼叫 getPendingShops，
 * 仍會取得完整店家列表。
 */
export const getPendingShops = getAdminShops

export const updateShopStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = String(req.params.id ?? '')
    const { status } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: '審核狀態錯誤',
      })
      return
    }

    const shop = await Shop.findById(id)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '找不到店家',
      })
      return
    }

    shop.status = status

    await shop.save()

    res.status(200).json({
      success: true,
      message: status === 'approved' ? '店家審核通過' : '店家審核未通過',
      result: shop,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /admin/shop/:id
 *
 * Admin 永久刪除店家
 *
 * 只有 Admin 可以刪除任意店家，
 * 與 DELETE /shop/:id 的會員 Owner 權限分開。
 */
export const deleteAdminShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = String(req.params.id ?? '')

    if (!id) {
      res.status(400).json({
        success: false,
        message: '缺少店家 ID',
      })
      return
    }

    const shop = await Shop.findById(id)

    if (!shop) {
      res.status(404).json({
        success: false,
        message: '找不到店家',
      })
      return
    }

    await shop.deleteOne()

    res.status(200).json({
      success: true,
      message: '刪除店家成功',
    })
  } catch (error) {
    next(error)
  }
}

const isValidShopLocation = (location: unknown): location is IShopLocation => {
  if (typeof location !== 'object' || location === null) {
    return false
  }

  const value = location as {
    type?: unknown
    coordinates?: unknown
  }

  if (value.type !== 'Point') {
    return false
  }

  if (!Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
    return false
  }

  const [longitude, latitude] = value.coordinates

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return false
  }

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  )
}
