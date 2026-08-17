import { Router } from 'express'

import * as controllerShop from '../controllers/shop'
import * as middlewareAuth from '../middlewares/auth'

const router = Router()

// Admin 取得所有待審核店家
router.get('/', middlewareAuth.jwt, middlewareAuth.admin, controllerShop.getPendingShops)
router.patch(
  '/:id/status',
  middlewareAuth.jwt,
  middlewareAuth.admin,
  controllerShop.updateShopStatus,
)

export default router
