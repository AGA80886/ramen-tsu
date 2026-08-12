import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import Article from '../models/article'
import ArticleComment from '../models/articleComment'

interface CreateCommentBody {
  content: string
}

/**
 * 取得指定文章的留言
 * GET /article/:articleId/comments
 *
 * 僅允許公開文章的留言被取得。
 */
export const getComments = async (req: Request, res: Response): Promise<void> => {
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

  const result = await ArticleComment.find({
    article: articleId,
  })
    .populate('author', 'account nickname avatar')
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
 * 建立留言
 * POST /article/:articleId/comments
 *
 * 必須登入。
 * 只能留言在 approved 文章。
 */
export const createComment = async (req: Request, res: Response): Promise<void> => {
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

  const body = req.body as CreateCommentBody

  const content = body.content?.trim()

  if (!content) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '留言內容必填',
    })

    return
  }

  const comment = await ArticleComment.create({
    article: article._id,
    author: req.user!._id,
    content,
  })

  const result = await ArticleComment.findById(comment._id).populate(
    'author',
    'account nickname avatar',
  )

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: '留言成功',
    result,
  })
}

/**
 * 刪除留言
 * DELETE /article/:articleId/comments/:commentId
 *
 * 留言本人可以刪除自己的留言。
 * Admin 可以刪除任何留言。
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const articleId = String(req.params.articleId ?? '')

  const commentId = String(req.params.commentId ?? '')

  if (!mongoose.isValidObjectId(articleId) || !mongoose.isValidObjectId(commentId)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: '文章或留言 ID 格式錯誤',
    })

    return
  }

  const comment = await ArticleComment.findOne({
    _id: commentId,
    article: articleId,
  })

  if (!comment) {
    throw new Error('ARTICLE COMMENT NOT FOUND')
  }

  const isAdmin = req.user!.role === 'admin'

  const isOwner = comment.author.toString() === req.user!._id.toString()

  if (!isAdmin && !isOwner) {
    throw new Error('ARTICLE COMMENT FORBIDDEN')
  }

  await comment.deleteOne()

  res.status(StatusCodes.OK).json({
    success: true,
    message: '留言已刪除',
  })
}
