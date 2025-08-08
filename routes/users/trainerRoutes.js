import { Router } from "express";
import trainerController from "../../controllers/users/trainerController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { singleFileUpload, handleMulterError, validateUploadedFiles } from "../../middlewares/fileUpload.js";

const trainerRouter = Router()

/**
 * @swagger
 * /api/v1/user/trainer/list:
 *   get:
 *     summary: Fetch all trainers
 *     description: Retrieve a list of all trainers in the system. This endpoint requires authentication and appropriate authorization.
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of trainers per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter trainers by active status
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter trainers by expertise area
 *     responses:
 *       200:
 *         description: Successfully retrieved trainers list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Trainer'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
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
trainerRouter.get('/list', authenticate, authorize('admin', 'trainer'), trainerController.fetchAllTrainers)

/**
 * @swagger
 * /api/v1/user/trainer/create:
 *   post:
 *     summary: Create a new trainer
 *     description: Create a new trainer account with the provided information. This endpoint requires admin authentication.
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sarah Johnson"
 *                 description: Full name of the trainer
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "sarah.johnson@example.com"
 *                 description: Trainer's email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Trainer's password (min 6 characters)
 *                 minLength: 6
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Trainer's phone number
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "female"
 *                 description: Trainer's gender
 *               profileImage:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *                 description: URL to trainer's profile image
 *               position:
 *                 type: string
 *                 example: "Senior Developer"
 *                 description: Trainer's position or title
 *               expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Node.js", "MongoDB"]
 *                 description: Areas of expertise
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: "Monday"
 *                     startTime:
 *                       type: string
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       example: "17:00"
 *                 example:
 *                   - day: "Monday"
 *                     startTime: "09:00"
 *                     endTime: "17:00"
 *                   - day: "Wednesday"
 *                     startTime: "10:00"
 *                     endTime: "18:00"
 *                 description: Trainer's availability schedule
 *               bio:
 *                 type: string
 *                 example: "Experienced software developer with 5+ years in web development and a passion for teaching."
 *                 description: Trainer's biography
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: Trainer's active status
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
 *                 message:
 *                   type: string
 *                   example: trainer created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer:
 *                       $ref: '#/components/schemas/Trainer'
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
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Email already exists
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
trainerRouter.post('/create', authenticate, authorize('admin'), trainerController.createTrainer)

/**
 * @swagger
 * /api/v1/user/trainer/{trainerId}/profile:
 *   get:
 *     summary: Get trainer profile
 *     description: Retrieve a specific trainer's profile information including profile image
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Trainer profile retrieved successfully
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
 *                     trainer:
 *                       $ref: '#/components/schemas/Trainer'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Trainer not found
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
trainerRouter.get('/:trainerId/profile', authenticate, authorize('admin', 'trainer'), trainerController.getTrainerProfile)

/**
 * @swagger
 * /api/v1/user/trainer/{trainerId}/profile-image:
 *   post:
 *     summary: Upload trainer profile image
 *     description: Upload a profile image for a specific trainer. Supports image optimization and thumbnail generation.
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPG, PNG, GIF)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: cloudinary
 *                 description: Storage provider to use
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
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
 *                   example: Profile image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer:
 *                       $ref: '#/components/schemas/Trainer'
 *                     imageInfo:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/profile.jpg"
 *                         thumbnailUrl:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/thumb_profile.jpg"
 *                         filename:
 *                           type: string
 *                           example: "profile.jpg"
 *       400:
 *         description: Bad request - Invalid file or missing file
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
 *       404:
 *         description: Trainer not found
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
trainerRouter.post('/:trainerId/profile-image',
  authenticate,
  authorize('admin'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  trainerController.uploadProfileImage
)

/**
 * @swagger
 * /api/v1/user/trainer/{trainerId}/profile-image:
 *   put:
 *     summary: Update trainer profile image
 *     description: Update a trainer's profile image. This will delete the old image and upload a new one.
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New profile image file (JPG, PNG, GIF)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: cloudinary
 *                 description: Storage provider to use
 *     responses:
 *       200:
 *         description: Profile image updated successfully
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
 *                   example: Profile image updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer:
 *                       $ref: '#/components/schemas/Trainer'
 *                     imageInfo:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/profile.jpg"
 *                         thumbnailUrl:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/thumb_profile.jpg"
 *                         filename:
 *                           type: string
 *                           example: "profile.jpg"
 *       400:
 *         description: Bad request - Invalid file or missing file
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
 *       404:
 *         description: Trainer not found
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
trainerRouter.put('/:trainerId/profile-image',
  authenticate,
  authorize('admin'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  trainerController.updateProfileImage
)

/**
 * @swagger
 * /api/v1/user/trainer/{trainerId}/profile-image:
 *   delete:
 *     summary: Delete trainer profile image
 *     description: Remove a trainer's profile image from storage and update the trainer record
 *     tags: [Trainers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
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
 *                   example: Profile image deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainer:
 *                       $ref: '#/components/schemas/Trainer'
 *       400:
 *         description: Bad request - No profile image to delete
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
 *       404:
 *         description: Trainer not found
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
trainerRouter.delete('/:trainerId/profile-image',
  authenticate,
  authorize('admin'),
  trainerController.deleteProfileImage
)

export default trainerRouter