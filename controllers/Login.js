import SchoolHeadModel from "../models/SheadModel.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ManagementModel from "../models/managementModel.js";
import TeacherModel from "../models/teacherModel.js";
import StudentModel from "../models/studentModel.js";
import ConnectionToDatabase from "../Database/connection.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';


/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Create a new school head account
 *     description: This endpoint allows creating a new school head account. It requires username, email, state, password, and school code in the request body.
 *     tags:
 *       - School Head
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the school head.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email of the school head.
 *               state:
 *                 type: string
 *                 description: The state of the school head.
 *               password:
 *                 type: string
 *                 description: The password for the account.
 *             required:
 *               - username
 *               - email
 *               - state
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

export const SchoolHeadCreateAccount = async (req, res) => {
    try {
        const { username, email, state, password } = req.body;
        console.log(req.body);
        const schoolCode = req.headers.code;

        if (!username || !email || !state || !schoolCode || !password) {
            return res.status(400).json({
                status: false,
                message: "All Fields are Required",
            });
        }

        const db = req.db;
        const SchoolHead = SchoolHeadModel(db);

        const jsonFilePath = path.join(__dirname, '../data/schoolCodes.json'); // Corrected path
        let schoolCodes = [];

        try {
            const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
            schoolCodes = JSON.parse(fileContent);
        } catch (err) {
            console.error("Error reading JSON file:", err);
        }

        if (schoolCodes.includes(schoolCode)) {
            return res.status(400).json({
                status: false,
                message: "School code already exists",
            });
        }

        const existUser = await SchoolHead.findOne({ email });
        if (existUser) {
            return res.status(400).json({
                status: false,
                message: "User already exists",
            });
        }

        const hashedPass = await bcrypt.hash(password, 10); // Increased salt rounds for better security

        const newSchoolHead = new SchoolHead({
            username,
            email,
            state,
            schoolCode,
            password: hashedPass,
        });

        await newSchoolHead.save();

        schoolCodes.push(schoolCode);
        fs.writeFileSync(jsonFilePath, JSON.stringify(schoolCodes, null, 2));

        return res.status(201).json({
            status: true,
            message: "User Created",
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: false,
            message: "Error while signing up the user",
        });
    }
};

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login for School Heads, Management, Teachers, and Students
 *     description: Login functionality for different roles such as Head, Management, Teacher, and Student. It returns a JWT token and sets cookies in the response for the session.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address used for login.
 *               password:
 *                 type: string
 *                 description: The password for login.
 *               role:
 *                 type: string
 *                 enum: [Head, Management, Teacher, Student]
 *                 description: The role of the user (Head, Management, Teacher, or Student).
 *     responses:
 *       200:
 *         description: Login successful. JWT token and role are returned in the response along with setting cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login Success
 *                 token:
 *                   type: string
 *                   description: The JWT token for the logged-in user.
 *                 role:
 *                   type: string
 *                   description: The role of the user.
 *                 data:
 *                   type: object
 *                   description: User data without password.
 *       400:
 *         description: Invalid input or credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Either Username or Password is Invalid
 *       401:
 *         description: User does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User Not Exist
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error while logging in the user
 */


export const loginSchoolHead = async (req,res)=>{
    try{
        const {email,password,role} = req.body;
        if(!email || !password || !role){
            return res.status(400).json({
                status:false,
                message:"Both Email, Password are Required"
            })
        }
        if(role=="Head"){
            const SchoolHead = SchoolHeadModel(req.db);
            const head = await SchoolHead.findOne({ email:email }).select('+password');
            if (!head) {
                return res.status(401).json({
                    status: false,
                    message: 'User Not Exist'
                })
            }
            const { pass, ...userWithoutPassword } = head.toJSON();
            const ComparePass = await bcrypt.compare(password, head.password);
            if (!ComparePass) {
                return res.status(400).json({
                    status: false,
                    message: 'Either Username or Password is Invalid'
                })
            }
            const token = await jwt.sign(userWithoutPassword, process.env.jwt_secret_Head, { expiresIn: '25d' });
            return res
            .cookie("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("role",role,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                status: true,
                message: 'Login Success',
                token: `${token}`,
                role:role,
                data:userWithoutPassword
            });
        } else if(role==='Management'){
            const Management = ManagementModel(req.db);
            const management = await Management.findOne({ email:email }).select('+password');
            if (!management) {
                return res.status(401).json({
                    status: false,
                    message: 'User Not Exist'
                })
            }
            if(password!==management.password){
                return res.status(400).json({
                    status: false,
                    message: 'Either Username or Password is Invalid'
                })
            }
            const userWithoutPassword = management.toObject();
            delete userWithoutPassword.password;
            const token = await jwt.sign(userWithoutPassword, process.env.jwt_secret_Management, { expiresIn: '25d' });
            return res
            .cookie("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("role",role,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                status: true,
                message: 'Login Success',
                token: `${token}`,
                role:role,
            })
        } else if(role==='Teacher'){
            const Teacher = TeacherModel(req.db);
            const teacherDetail = await Teacher.findOne({ email:email }).select('+password');
            if (!teacherDetail) {
                return res.status(401).json({
                    status: false,
                    message: 'User Not Exist'
                })
            }
            console.log(password,teacherDetail.password);
            if (!password===teacherDetail.password) {
                return res.status(400).json({
                    status: false,
                    message: 'Either Username or Password is Invalid'
                })
            }
            const userWithoutPassword = teacherDetail.toObject();
            delete userWithoutPassword.password;
            const token = await jwt.sign(userWithoutPassword, process.env.jwt_secret_Teacher, { expiresIn: '25d' });
            return res
            .cookie("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("role",role,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({     
                status: true,
                message: 'Login Success',
                role:role,
                token: `${token}`,
                data:userWithoutPassword
            })
        } else if(role==="Student"){
            const Student = StudentModel(req.db);
            const studentDetail = await Student.findOne({ rollNumber:email }).select('+password');
            if (!studentDetail) {
                return res.status(401).json({
                    status: false,
                    message: 'User Not Exist'
                })
            }
            console.log(password,studentDetail.password);
            if (!password===studentDetail.password) {
                return res.status(400).json({
                    status: false,
                    message: 'Either Username or Password is Invalid'
                })
            }
            const userWithoutPassword = studentDetail.toObject();
            delete userWithoutPassword.password;
            delete userWithoutPassword.performance;
            const token = await jwt.sign(userWithoutPassword, process.env.jwt_secret_Student, { expiresIn: '25d' });
            return res
            .cookie("token",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("role",role,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({     
                status: true,
                message: 'Login Success',
                role:role,
                token: `${token}`,
                data:userWithoutPassword
            })
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({
            status:false,
            message:"Error while log in the user"
        })
    }
}

/**
 * @swagger
 * /api/verify:
 *   get:
 *     summary: Verify the JWT token and return user data based on role
 *     description: This endpoint verifies the JWT token sent via cookies and returns the user data if the token is valid. The user role determines which database is accessed.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: User is authenticated and verified, and user data is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: The user data object returned after verification.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique identifier of the user in the database.
 *                       example: "609c72ef3b0f0c001f8b4567"
 *                     name:
 *                       type: string
 *                       description: The name of the user.
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       description: The email of the user.
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       description: The role of the user (e.g., Head, Student, Management, Teacher).
 *                       example: "Student"
 *                     schoolCode:
 *                       type: string
 *                       description: The unique code of the school.
 *                       example: "XYZ123"
 *       401:
 *         description: Unauthorized or invalid token/role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Role is missing" # Or "Token is missing", "Invalid role", etc.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Error -> Verify User"
 */



export const verifyUser = async (req, res) => {
    try {
        const role = req.cookies.role;
        if (!role) {
            return res.status(401).json({
                status: false,
                message: "Role is missing",
            });
        }
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Token is missing",
            });
        }
        console.log("role is here : ",role);
        let secret;
        if (role === 'Head') {
            secret = process.env.jwt_secret_Head;
        } else if (role === 'Student') {
            secret = process.env.jwt_secret_Student;
        } else if (role === 'Management') {
            secret = process.env.jwt_secret_Management;
        } else if (role === 'Teacher') {
            secret = process.env.jwt_secret_Teacher;
        } else {
            return res.status(401).json({
                status: false,
                message: "Invalid role",
            });
        }
        const verify = await promisify(jwt.verify)(token, secret);
        if (!verify) {
            return res.status(401).json({
                status: false,
                message: "JWT not verified",
            });
        }
        delete verify.password;
        console.log(verify);
        if(role==='Student'){
            console.log("school code is : ",verify.schoolCode);
            const db = await ConnectionToDatabase(process.env.DB_username, process.env.DB_password, verify.schoolCode);
            const Student = StudentModel(db);
            const student = await Student.findById(verify._id);
            delete student.password;
            return res.status(200).json({
                status:true,
                data:student
            });
        }
        return res.status(200).json({
            status: true,
            data: verify,
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.log("Reached here")
            return res.status(401).json({
                status: false,
                message: "JWT not verified",
            });
        }
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Internal Error -> Verify User",
        });
    }
};

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout and clear user session
 *     description: This endpoint clears the JWT token and role cookies, effectively logging the user out.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successfully logged out and cookies cleared.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cookie Cleared
 *       401:
 *         description: Error logging out due to session issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error logging out
 */


export const logout = (req,res)=>{
    try{
        return res
        .clearCookie("token", { path: "/", httpOnly: true })
        .status(200)
        .json({
            status:true,
            message:"Cookie Cleared"
        });
    } catch(error){
        console.log(error.message);
        return res.status(401).json({
            status:false,
            message:"Error logging out"
        })
    }
}