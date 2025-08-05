import { Router } from "express";
import studentControllers from "../../controllers/users/studentController.js";

const studentRouter = Router()


studentRouter.get('/list', studentControllers.fetchAllStudents)

studentRouter.post('/create', studentControllers.createStudent)


export default studentRouter