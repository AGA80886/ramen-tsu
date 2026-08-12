import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import Article from '../models/article'
import ArticleFavorite from '../models/articleFavorite'

/**
 * 取得目前登入會員是否收藏指定文章
 *
 * GET /article/:articleId/favorite
 * Login required
 */
export const getMyFavoriteStatus = async (req: Request, res: Response): Promise<void> => {
  const articleId = String(req.params.articleId ?? '')

  if (!mongoose.isValidObjectId(articleId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })

    return
  }

  const article = await Article.findOne({
    _id: articleId,
    status: 'approved',
  })

  if (!article) {
    throw new Error('ARTICLE NOT FOUND')
  }

  const favorite = await ArticleFavorite.findOne({
    article: article._id,
    user: req.user!._id,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: {
      favorited: Boolean(favorite),
    },
  })
}

/**
 * 收藏文章
 *
 * POST /article/:articleId/favorite
 * Login required
 */
export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  const articleId = String(req.params.articleId ?? '')

  if (!mongoose.isValidObjectId(articleId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })

    return
  }

  const article = await Article.findOne({
    _id: articleId,
    status: 'approved',
  })

  if (!article) {
    throw new Error('ARTICLE NOT FOUND')
  }

  const existingFavorite = await ArticleFavorite.findOne({
    article: article._id,
    user: req.user!._id,
  })

  // 已收藏時不建立第二筆
  if (existingFavorite) {
    res.status(StatusCodes.OK).json({
      success: true,
      message: '已收藏',
      result: {
        favorited: true,
      },
    })

    return
  }

  await ArticleFavorite.create({
    article: article._id,
    user: req.user!._id,
  })

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '收藏成功',
    result: {
      favorited: true,
    },
  })
}

/**
 * 取消收藏
 *
 * DELETE /article/:articleId/favorite
 * Login required
 */
export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  const articleId = String(req.params.articleId ?? '')

  if (!mongoose.isValidObjectId(articleId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })

    return
  }

  const article = await Article.findOne({
    _id: articleId,
    status: 'approved',
  })

  if (!article) {
    throw new Error('ARTICLE NOT FOUND')
  }

  await ArticleFavorite.findOneAndDelete({
    article: article._id,
    user: req.user!._id,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '已取消收藏',
    result: {
      favorited: false,
    },
  })
}

/**
 * 取得目前登入會員的收藏文章
 *
 * GET /article/favorites/me
 * Login required
 */
export const getMyFavorites = async (req: Request, res: Response): Promise<void> => {
  const favorites = await ArticleFavorite.find({
    user: req.user!._id,
  })
    .sort({
      createdAt: -1,
    })
    .populate({
      path: 'article',

      // 即使文章收藏後被下架，
      // 我的收藏列表也不應公開顯示它
      match: {
        status: 'approved',
      },
    })

  /**
   * populate + match 找不到 approved article 時，
   * article 會變成 null。
   *
   * 所以需要過濾掉。
   */
  const result = favorites.filter((favorite) => favorite.article !== null)

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}
