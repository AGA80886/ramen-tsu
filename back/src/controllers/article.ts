import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import Article from '../models/article'
import type { TArticleCategory } from '../models/article'

interface CreateArticleBody {
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  category: TArticleCategory
  published?: boolean
}

interface UpdateArticleBody {
  title?: string
  slug?: string
  summary?: string
  content?: string
  coverImage?: string
  category?: TArticleCategory
  published?: boolean
}

export const create = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '')

  if (!mongoose.isValidObjectId(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章 ID 格式錯誤',
    })
    return
  }

  const body = req.body as CreateArticleBody

  const result = await Article.create({
    title: body.title,
    slug: body.slug,
    summary: body.summary,
    content: body.content,
    coverImage: body.coverImage,
    category: body.category,
    published: body.published ?? false,
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

  const body = req.body as UpdateArticleBody
  const updateData: UpdateArticleBody = {}

  if (body.title !== undefined) {
    updateData.title = body.title
  }

  if (body.slug !== undefined) {
    updateData.slug = body.slug
  }

  if (body.summary !== undefined) {
    updateData.summary = body.summary
  }

  if (body.content !== undefined) {
    updateData.content = body.content
  }

  if (body.coverImage !== undefined) {
    updateData.coverImage = body.coverImage
  }

  if (body.category !== undefined) {
    updateData.category = body.category
  }

  if (body.published !== undefined) {
    updateData.published = body.published
  }

  const result = await Article.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })

  if (!result) {
    throw new Error('ARTICLE NOT FOUND')
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: '文章更新成功',
    result,
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
