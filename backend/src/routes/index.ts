import { Router } from 'express'
import heartbeat from './heartbeat'
import uploads from './uploads'
import bmi from './bmi'

const router = Router({ mergeParams: true })

router.use(heartbeat)
router.use(uploads)
router.use(bmi)




export default router