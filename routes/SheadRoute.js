import express from "express";
import {SchoolHeadCreateAccount , loginSchoolHead,verifyUser,logout} from '../controllers/Login.js';
const SchoolHeadRoutes = express.Router();
import ConnectionToSpecificDatabase from '../middleware/middleware.js'; 

SchoolHeadRoutes.route('/signup')
.post(ConnectionToSpecificDatabase,SchoolHeadCreateAccount);

SchoolHeadRoutes.route('/login')
.post(ConnectionToSpecificDatabase,loginSchoolHead);

SchoolHeadRoutes.route('/verify')
.get(verifyUser);

SchoolHeadRoutes.route('/logout')
.get(logout);

export default SchoolHeadRoutes;