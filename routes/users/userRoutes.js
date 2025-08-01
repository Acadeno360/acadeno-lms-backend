import { Router } from 'express'
import studentRouter from './studentRoutes.js'
import authController from '../../controllers/users/authController.js'
import { authenticate } from '../../middlewares/authenticate.js'

const userRouter = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64c3af23e897ad238cabc123
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: user@example.com
 *         role:
 *           type: string
 *           example: student
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-08-01T07:10:47.403Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-08-01T07:10:47.403Z
 */


/**
 * @swagger
 * /api/v1/users/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: student
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email, password or role
 *       401:
 *         description: Invalid credentials
 */
userRouter.post('/auth/login', authController.login )



/**
 * @swagger
 * /api/v1/users/auth:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */
userRouter.get('/auth/me', authenticate, authController.getMe)

userRouter.use('/student', studentRouter)


export default userRouter