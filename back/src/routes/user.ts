import { Router } from 'express'
import * as middlewareAuth from '../middlewares/auth'
import uploadAvatar from '../middlewares/uploadAvatar'
import * as controllerUser from '../controllers/user'

const router = Router()

router.get('/me', middlewareAuth.jwt, controllerUser.getMe)
router.patch('/me', middlewareAuth.jwt, controllerUser.updateMe)
router.patch('/me/avatar', middlewareAuth.jwt, uploadAvatar, controllerUser.updateAvatar)
router.patch('/me/password', middlewareAuth.jwt, controllerUser.updatePassword)

router.patch('/cart', middlewareAuth.jwt, controllerUser.cart)
router.get('/cart', middlewareAuth.jwt, controllerUser.getCart)

router.post('/me/email-verification', middlewareAuth.jwt, controllerUser.requestEmailVerification)
router.post('/email-verification/verify', controllerUser.verifyEmail)

export default router
