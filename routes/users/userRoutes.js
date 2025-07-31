import { Router } from 'express'
import studentRouter from './studentRoutes.js'
import authController from '../../controllers/users/authController.js'
import { authenticate } from '../../middlewares/authenticate.js'

const userRouter = Router()

userRouter.post('/auth/login', authController.login )

userRouter.get('/auth', authenticate, authController.getMe)

userRouter.use('/student', studentRouter)


export default userRouter