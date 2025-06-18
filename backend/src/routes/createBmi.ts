import { Router, Request, Response } from 'express'
import { errorHandler } from '../utils'
import knex from 'knex'
import { databaseConfig } from '../config'

const router = Router()
const db = knex(databaseConfig)


router.get('/user/oi', errorHandler(async (req: Request, res: Response) => {
  const { id, height, weight,age, bmi } = req.body;

  if (!id || !height || !weight || !age || !bmi) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const [record] = await db('bmi_records')
    .insert({ id, height, weight, bmi })
    .returning('*');

  res.status(201).json(record);
}));