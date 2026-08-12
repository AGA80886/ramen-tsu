import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import Article from '../models/article'
import ArticleLike from '../models/articleLike'

/**
 * 取得文章按讚狀態
 * GET /article/:articleId/likes
 *
 * Public:
 * - 所有人都能看到 count
 *
 * 如果之後想讓 GET 同時回 liked，
 * 需要 optional JWT。
 * 第一版先只回 count 最單純。
 */
export const getLikes = async (req: Request, res: Response): Promise<void> => {
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

  const count = await ArticleLike.countDocuments({
    article: articleId,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: {
      count,
    },
  })
}

/**
 * 新增按讚
 * POST /article/:articleId/likes
 *
 * Login required
 */
export const addLike = async (req: Request, res: Response): Promise<void> => {
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

  const existingLike = await ArticleLike.findOne({
    article: article._id,
    user: req.user!._id,
  })

  // 做成 idempotent：
  // 已經按過讚時不建立第二筆，也不回 500
  if (existingLike) {
    const count = await ArticleLike.countDocuments({
      article: article._id,
    })

    res.status(StatusCodes.OK).json({
      success: true,
      message: '已按讚',
      result: {
        liked: true,
        count,
      },
    })

    return
  }

  await ArticleLike.create({
    article: article._id,
    user: req.user!._id,
  })

  const count = await ArticleLike.countDocuments({
    article: article._id,
  })

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '按讚成功',
    result: {
      liked: true,
      count,
    },
  })
}

/**
 * 取消按讚
 * DELETE /article/:articleId/likes
 *
 * Login required
 */
export const removeLike = async (req: Request, res: Response): Promise<void> => {
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

  await ArticleLike.findOneAndDelete({
    article: article._id,
    user: req.user!._id,
  })

  const count = await ArticleLike.countDocuments({
    article: article._id,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '已取消按讚',
    result: {
      liked: false,
      count,
    },
  })
}

/**
 * 取得目前登入會員的按讚狀態
 * GET /article/:articleId/likes/me
 *
 * Login required
 */
export const getMyLikeStatus = async (req: Request, res: Response): Promise<void> => {
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

  const like = await ArticleLike.findOne({
    article: article._id,
    user: req.user!._id,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result: {
      liked: Boolean(like),
    },
  })
}
