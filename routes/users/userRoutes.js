import { Router } from 'express'
import studentRouter from './studentRoutes.js'

const userRouter = Router()

userRouter.use('/student', studentRouter)


export default userRouter