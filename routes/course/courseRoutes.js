import { Router } from "express";
import courseControllers from "../../controllers/course/courseController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";

const courseRouter = Router()

courseRouter.post('/add', authenticate, authorize('admin'), courseControllers.createCourse)

export default courseRouter;