import { Router } from 'express'
import studentRouter from './studentRoutes.js'
import authController from '../../controllers/users/authController.js'
import { authenticate } from '../../middlewares/authenticate.js'
import trainerRouter from './trainerRoutes.js'

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
 * /api/v1/user/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email, password, and role. Returns a JWT token for subsequent API calls.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - Missing email, password or role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.post('/auth/login', authController.login )

/**
 * @swagger
 * /api/v1/user/auth/me:
 *   get:
 *     summary: Get authenticated user details
 *     description: Retrieve the current authenticated user's profile information using the JWT token.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
userRouter.get('/auth/me', authenticate, authController.getMe)

userRouter.use('/student', studentRouter)

userRouter.use('/trainer', trainerRouter)

export default userRouter