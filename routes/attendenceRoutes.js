import express from 'express';

import { checkAttendanceToday, markAttendance, getMonthlyAttendance, getYearlyAttendance } from '../controllers/attendenceController.js';
import ConnectionToSpecificDatabase from '../middleware/middleware.js';
import HeadManagementTeacher from '../middleware/HeadManagmentTeacher.js';
import SharedAccess from '../middleware/SharedAccess.js';
const attendenceRoutes = express.Router();

// Check today's attendance for a student
attendenceRoutes.route('/attendance')
.get(HeadManagementTeacher,checkAttendanceToday)
.post(HeadManagementTeacher,markAttendance);

attendenceRoutes.get('/attandance/monthly',SharedAccess,getMonthlyAttendance);

attendenceRoutes.get('/attandance/yearly',SharedAccess,getYearlyAttendance);


export default attendenceRoutes;
