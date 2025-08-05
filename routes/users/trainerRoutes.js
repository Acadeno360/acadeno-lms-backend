import { Router } from "express";
import trainerController from "../../controllers/users/trainerController.js";

const trainerRouter = Router()





/**
 * @swagger
 * /api/v1/trainer/list:
 *   post:
 *     summary: Fetch all trainers
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer fetched successfully
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
trainerRouter.get('/list', trainerController.fetchAllTrainers)



/**
 * @swagger
 * /api/v1/trainer/all:
 *   get:
 *     summary: Create a new trainer 
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer created successfully
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
trainerRouter.post('/create', trainerController.createTrainer)



export default trainerRouter