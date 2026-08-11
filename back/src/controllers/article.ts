import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import cloudinary from '../configs/cloudinary'
import Article from '../models/article'
import type { TArticleCategory, TArticleStatus } from '../models/article'

interface CreateArticleBody {
  title: string
  slug: string
  summary: string
  content: string
  category: TArticleCategory
}

interface UpdateArticleBody {
  title?: string
  slug?: string
  summary?: string
  content?: string
  category?: TArticleCategory
}

interface UpdateArticleStatusBody {
  status: TArticleStatus
}

/**
 * 會員建立文章
 * POST /article
 *
 * 建立後直接進 pending，
 * 不允許前端自行指定 approved。
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateArticleBody

  if (!req.file?.filename) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章封面圖片必填',
    })
    return
  }

  const result = await Article.create({
    title: body.title,
    slug: body.slug,
    summary: body.summary,
    content: body.content,
    coverImage: req.file.filename,
    category: body.category,

    // 會員文章一律等待管理員審核
    status: 'pending',

    author: req.user!._id,
  })

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '文章已送出，等待管理員審核',
    result,
  })
}

/**
 * 公開論壇文章列表
 * GET /article
 *
 * 只顯示管理員已核准文章。
 */
export const get = async (_req: Request, res: Response): Promise<void> => {
  const result = await Article.find({
    status: 'approved',
  })
    .populate('author', 'account nickname')
    .sort({
      createdAt: -1,
    })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

/**
 * 公開文章詳情
 * GET /article/:slug
 *
 * 未通過審核的文章不能公開取得。
 */
export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params.slug ?? '')

  const result = await Article.findOne({
    slug,
    status: 'approved',
  }).populate('author', 'account nickname')

  if (!result) {
    throw new Error('ARTICLE NOT FOUND')
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

/**
 * Admin：取得全部文章
 * GET /article/admin
 *
 * draft / pending / approved / rejected
 * 全部都可以看到。
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  const result = await Article.find().populate('author', 'account nickname email').sort({
    createdAt: -1,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}

/**
 * 修改文章內容
 * PATCH /article/:id
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '')

  if (!mongoose.isValidObjectId(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })
    return
  }

  const article = await Article.findById(id)

  if (!article) {
    throw new Error('ARTICLE NOT FOUND')
  }

  const isAdmin = req.user!.role === 'admin'

  const isOwner = article.author.toString() === req.user!._id.toString()

  if (!isAdmin && !isOwner) {
    throw new Error('ARTICLE FORBIDDEN')
  }

  const body = req.body as UpdateArticleBody

  if (body.title !== undefined) {
    article.title = body.title
  }

  if (body.slug !== undefined) {
    article.slug = body.slug
  }

  if (body.summary !== undefined) {
    article.summary = body.summary
  }

  if (body.content !== undefined) {
    article.content = body.content
  }

  if (body.category !== undefined) {
    article.category = body.category
  }

  const oldCoverImage = article.coverImage

  if (req.file?.filename) {
    article.coverImage = req.file.filename
  }

  // 任何內容修改後都重新送審
  article.status = 'pending'

  await article.save()

  if (req.file?.filename && oldCoverImage && oldCoverImage !== req.file.filename) {
    await cloudinary.uploader.destroy(oldCoverImage).catch((cleanupError) => {
      console.error('刪除舊文章封面失敗', cleanupError)
    })
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '文章已更新，等待重新審核',
    result: article,
  })
}

/**
 * Admin：審核文章
 * PATCH /article/:id/status
 */
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '')

  if (!mongoose.isValidObjectId(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })
    return
  }

  const body = req.body as UpdateArticleStatusBody

  const allowedStatuses: TArticleStatus[] = ['approved', 'rejected']

  if (!allowedStatuses.includes(body.status)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '審核狀態錯誤',
    })
    return
  }

  const result = await Article.findByIdAndUpdate(
    id,
    {
      status: body.status,
    },
    {
      new: true,
      runValidators: true,
    },
  )

  if (!result) {
    throw new Error('ARTICLE NOT FOUND')
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: body.status === 'approved' ? '文章審核通過' : '文章已拒絕',
    result,
  })
}

/**
 * Admin：刪除文章
 * DELETE /article/:id
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '')

  if (!mongoose.isValidObjectId(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })
    return
  }

  const article = await Article.findById(id)

  if (!article) {
    throw new Error('ARTICLE NOT FOUND')
  }

  const coverImage = article.coverImage

  await article.deleteOne()

  if (coverImage) {
    await cloudinary.uploader.destroy(coverImage).catch((cleanupError) => {
      console.error('刪除文章封面失敗', cleanupError)
    })
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '文章刪除成功',
  })
}

export const getMine = async (req: Request, res: Response): Promise<void> => {
  const result = await Article.find({
    author: req.user!._id,
  }).sort({
    createdAt: -1,
  })

  res.status(StatusCodes.OK).json({
    success: true,
    message: '',
    result,
  })
}
