import { Router } from "express";
import courseControllers from "../../controllers/course/courseController.js";

const courseRouter = Router()

courseRouter.post('/add', courseControllers.createCourse)

export default courseRouter;