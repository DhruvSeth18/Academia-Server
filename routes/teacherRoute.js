import express from 'express';
import { addTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher, addResources, getResources} from '../controllers/teacherController.js';
import ConnectionToSpecificDatabase from '../middleware/middleware.js';
import headAccesss from '../middleware/headAccess.js';
import HeadManagement from '../middleware/headManagement.js';
import HeadManagementTeacher from '../middleware/HeadManagmentTeacher.js';
import SharedAccess from '../middleware/SharedAccess.js';
const teacherRoutes = express.Router();
teacherRoutes.route('/teachers')
.post(HeadManagement,addTeacher)
.get(HeadManagement,getTeachers);

teacherRoutes.route('/teacher/:id')
.get(ConnectionToSpecificDatabase,getTeacherById)
.put(headAccesss,updateTeacher)
.delete(headAccesss,deleteTeacher);

teacherRoutes.route('/resource/:id')
.get(SharedAccess,getResources)
.post(HeadManagementTeacher,addResources);

export default teacherRoutes;