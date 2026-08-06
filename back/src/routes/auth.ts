import { Router } from 'express'
import * as controllerAuth from '../controllers/auth'
import * as middlewareAuth from '../middlewares/auth'

const router = Router()

router.post('/register', controllerAuth.register)
router.post('/login', middlewareAuth.login, controllerAuth.login)
router.post('/refresh', controllerAuth.refresh)
router.post('/forgot-password', controllerAuth.forgotPassword)
router.post('/reset-password', controllerAuth.resetPassword)
router.delete('/logout', controllerAuth.logout)

export default router
