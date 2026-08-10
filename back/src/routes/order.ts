import { Router } from 'express'
import * as middlewareAuth from '../middlewares/auth'
import * as controllerOrder from '../controllers/order'

const router = Router()

router.post('/', middlewareAuth.jwt, controllerOrder.create)
router.get('/', middlewareAuth.jwt, controllerOrder.get)
router.get('/all', middlewareAuth.jwt, middlewareAuth.admin, controllerOrder.getAll)
router.patch('/:id/status', middlewareAuth.jwt, middlewareAuth.admin, controllerOrder.updateStatus)

export default router
