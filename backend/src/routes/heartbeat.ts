import { Router, Request, Response } from 'express'
import { errorHandler } from '../utils'
import knex from 'knex'
import { databaseConfig } from '../config'
const db = knex(databaseConfig)
const router = Router()

router.get('/heartbeat',
  errorHandler(async (req: Request, res: Response) => {
    return res.json({
      message: 'Message from backend, everything is ok!',
      env: process.env.NODE_ENV
    })
  })
)
// router.get('/user/bmi', errorHandler(async (req: Request, res: Response) => {
//   // const records = await db('bmi_records').select('*').orderBy('createdAt', 'desc')
//   // res.json(records)
//   return res.json({
//       message: 'Message from backend, everything is ok!',
//     })
// }))

export default router