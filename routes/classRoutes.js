import express from 'express';
import { createClass, addTeacherToClass, getClassStudents, updateClass, deleteClass, getAllClasses, getSectionsByClass} from '../controllers/classController.js';
import ConnectionToSpecificDatabase from '../middleware/middleware.js';
import headAccesss from '../middleware/headAccess.js';
import HeadManagement from '../middleware/headManagement.js';
const classRoutes = express.Router();

// Route to create a new class
classRoutes.route('/class')
.post(headAccesss,createClass)
.get(HeadManagement,getAllClasses)
.put(ConnectionToSpecificDatabase,updateClass);

// classRoutes.post('/class/addStudent',ConnectionToSpecificDatabase, addStudentToClass);

classRoutes.post('/class/addTeacher',ConnectionToSpecificDatabase, addTeacherToClass);
classRoutes.get('/class/:className/sections', HeadManagement,getSectionsByClass);

classRoutes.route('/class/:classId')
.get(ConnectionToSpecificDatabase,getClassStudents)
.delete(ConnectionToSpecificDatabase,deleteClass);

export default classRoutes;
