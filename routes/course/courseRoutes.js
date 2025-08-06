import { Router } from "express";
import courseControllers from "../../controllers/course/courseController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";

const courseRouter = Router()

/**
 * @swagger
 * /api/v1/course/add:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course with the provided information. This endpoint requires admin authentication.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - createdBy
 *               - courseHead
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Full Stack Web Development"
 *                 description: Course title
 *               type:
 *                 type: string
 *                 enum: [internship, course_project]
 *                 example: "internship"
 *                 description: Type of course
 *               createdBy:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc123"
 *                 description: Reference to course creator (admin)
 *               courseHead:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc125"
 *                 description: Reference to course head/trainer
 *               duration:
 *                 type: object
 *                 description: Course duration
 *                 properties:
 *                   years:
 *                     type: number
 *                     example: 1
 *                     description: Number of years
 *                   months:
 *                     type: number
 *                     example: 6
 *                     description: Number of months
 *                   days:
 *                     type: number
 *                     example: 0
 *                     description: Number of days
 *               fees:
 *                 type: number
 *                 example: 5000
 *                 description: Course fees in currency units
 *               level:
 *                 type: string
 *                 enum: [short-term, beginner, intermediate, expert]
 *                 example: "intermediate"
 *                 description: Course difficulty level
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *                 description: Course status
 *     responses:
 *       200:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: course created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions (admin required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Not found - Referenced user (createdBy or courseHead) not found
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
courseRouter.post('/add', authenticate, authorize('admin'), courseControllers.createCourse)

export default courseRouter;