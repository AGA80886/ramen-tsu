import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import Article from '../models/article'
import type { TArticleCategory } from '../models/article'
import cloudinary from '../configs/cloudinary'

interface CreateArticleBody {
  title: string
  slug: string
  summary: string
  content: string
  category: TArticleCategory
  published?: string
}

interface UpdateArticleBody {
  title?: string
  slug?: string
  summary?: string
  content?: string
  category?: TArticleCategory
  published?: string
}

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

    // Cloudinary public ID
    coverImage: req.file.filename,

    category: body.category,

    // form-data 傳進來的是字串
    published: body.published === 'true',

    author: req.user!._id,
  })

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '文章建立成功',
    result,
  })
}

export const get = async (_req: Request, res: Response): Promise<void> => {
  const result = await Article.find({
    published: true,
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

export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params.slug ?? '')

  const result = await Article.findOne({
    slug,
    published: true,
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

  if (body.published !== undefined) {
    article.published = body.published === 'true'
  }

  // 先記住舊封面 public ID
  const oldCoverImage = article.coverImage

  // 有上傳新封面才替換
  if (req.file?.filename) {
    article.coverImage = req.file.filename
  }

  await article.save()

  // DB 儲存成功後，再刪除舊封面
  if (req.file?.filename && oldCoverImage && oldCoverImage !== req.file.filename) {
    await cloudinary.uploader.destroy(oldCoverImage).catch((cleanupError) => {
      console.error('刪除舊文章封面失敗', cleanupError)
    })
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '文章更新成功',
    result: article,
  })
}

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '')

  if (!mongoose.isValidObjectId(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })
    return
  }

  const result = await Article.findByIdAndDelete(id)

  if (!result) {
    throw new Error('ARTICLE NOT FOUND')
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '文章刪除成功',
  })
}
