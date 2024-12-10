import StudentModel from "../models/studentModel.js";
import ClassModel from "../models/ClassModel.js";

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Add a new student
 *     description: Adds a new student to the database, validating the class and section information and ensuring the student does not already exist.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "JohnDoe"
 *               rollNumber:
 *                 type: string
 *                 example: "12345"
 *               className:
 *                 type: string
 *                 example: "10th"
 *               sectionName:
 *                 type: string
 *                 example: "A"
 *               password:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - username
 *               - rollNumber
 *               - className
 *               - sectionName
 *               - password
 *     responses:
 *       201:
 *         description: Successfully added the student.
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
 *                   example: "Student added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "JohnDoe"
 *                     rollNumber:
 *                       type: string
 *                       example: "12345"
 *                     class:
 *                       type: string
 *                       example: "10th"
 *                     section:
 *                       type: string
 *                       example: "A"
 *                     password:
 *                       type: string
 *                       example: "password123"
 *       400:
 *         description: Missing or invalid parameters.
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
 *                   example: "All Fields are Required"
 *       404:
 *         description: Student not found or class/section does not exist.
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
 *                   example: "Student not found"
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
 *                   example: "Error while adding student"
 */


export const addStudent = async (req, res) => {
    try {
        const { username, rollNumber, className,sectionName,password} = req.body;
        const schoolCode = req.schoolCode;
        if (!username || !rollNumber || !schoolCode || !className || !sectionName || !password) {
            return res.status(400).json({
                status: false,
                message: 'All Fields are Required',
            });
        }
        const db = req.db;
        const Class = await ClassModel(db);
        const Student = await StudentModel(db);
        const classData = await Class.findOne({className,sectionName});
        console.log(className,sectionName);

        if(!classData){
            return res.status(400).json({
                status:false,
                message:"Class name or Section not Exist"
            })
        }

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({
                status: false,
                message: 'Student already exists with this roll number',
            });
        }

        const newStudent = new Student({
            username,
            rollNumber,
            class: classData._id,
            schoolCode,
            password
        });

        const stuId = newStudent._id;

        if (!stuId) {
            return res.status(404).json({
                status: false,
                message: "Student not found",
            });
        }

        console.log("Student Id is ",classData);
        classData.students.push(stuId);
        console.log(classData);
        await classData.save();
        await newStudent.save();
        return res.status(201).json({
            status: true,
            message: 'Student added successfully',
            data: newStudent,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while adding student',
        });
    }
};

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get students by class and section
 *     description: Retrieves a list of students based on the specified class name and section name.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: className
 *         in: query
 *         description: The name of the class to fetch students from.
 *         required: true
 *         schema:
 *           type: string
 *           example: "10th"
 *       - name: sectionName
 *         in: query
 *         description: The section of the class to fetch students from.
 *         required: true
 *         schema:
 *           type: string
 *           example: "A"
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of students.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         example: "JohnDoe"
 *                       rollNumber:
 *                         type: string
 *                         example: "12345"
 *                       class:
 *                         type: string
 *                         example: "10th"
 *                       section:
 *                         type: string
 *                         example: "A"
 *       400:
 *         description: Failed to retrieve students.
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
 *                   example: "Failed to retrieve everything"
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
 *                   example: "Error while fetching students"
 */


export const getStudents = async (req, res) => {
    try {
        const {className , sectionName} = req.query;
        const db = req.db;
        
        const Class = await ClassModel(db);
        const Student = await StudentModel(db);
        await db.model('student', Student.schema);
        const students = await Class.findOne({className,sectionName}).populate('students');
        if(!students){
            return res.status(400).json({
                status:false,
                message:"Failed to retrieve everything"
            })
        }
        return res.status(200).json({
            status: true,
            data: students,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while fetching students',
        });
    }
};

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieves details of a student by their unique ID.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique ID of the student to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *           example: "60d2a92ef1b72c6e6f4f3b2c"
 *     responses:
 *       200:
 *         description: Successfully retrieved student details.
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
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "JohnDoe"
 *                     rollNumber:
 *                       type: string
 *                       example: "12345"
 *                     class:
 *                       type: object
 *                       properties:
 *                         className:
 *                           type: string
 *                           example: "10th"
 *                         sectionName:
 *                           type: string
 *                           example: "A"
 *       404:
 *         description: Student not found.
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
 *                   example: "Student not found"
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
 *                   example: "Error while fetching student"
 */


export const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const db = req.db;
        const Student = await StudentModel(db);
        const student = await Student.findById(studentId).populate('class');

        if (!student) {
            return res.status(404).json({
                status: false,
                message: 'Student not found',
            });
        }

        return res.status(200).json({
            status: true,
            data: student,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while fetching student',
        });
    }
};

/**
 * @swagger
 * /api/students/{id}/exam:
 *   post:
 *     summary: Add an exam result for a student
 *     description: Adds an exam result (subject, exam name, marks, and maximum marks) to a student's performance.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the student to add the exam for.
 *         required: true
 *         schema:
 *           type: string
 *           example: "60d2a92ef1b72c6e6f4f3b2c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               examName:
 *                 type: string
 *                 example: "Final Exam"
 *               marks:
 *                 type: integer
 *                 example: 85
 *               maxMarks:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Successfully added the exam result.
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
 *                   example: "Exam added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "JohnDoe"
 *                     rollNumber:
 *                       type: string
 *                       example: "12345"
 *                     performance:
 *                       type: object
 *                       properties:
 *                         exams:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               subject:
 *                                 type: string
 *                                 example: "Mathematics"
 *                               examName:
 *                                 type: string
 *                                 example: "Final Exam"
 *                               marks:
 *                                 type: integer
 *                                 example: 85
 *                               maxMarks:
 *                                 type: integer
 *                                 example: 100
 *       400:
 *         description: Insufficient exam details provided.
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
 *                   example: "Exam Details are insufficient"
 *       404:
 *         description: Student not found.
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
 *                   example: "Student not found"
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
 *                   example: "Error while adding exam"
 */

export const addStudentExam = async (req, res) => {
    try {
        const studentId = req.params.id;
        const {subject,examName,marks,maxMarks} = req.body;
        if(!subject || !examName || !marks || !maxMarks){
            return res.status(400).json({
                status:false,
                message:"Exam Details are insufficient"
            })
        }
        const db = req.db;
        const Student = await StudentModel(db);
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                status: false,
                message: 'Student not found',
            });
        }
        const newExam = {subject,examName,marks,maxMarks};
        student.performance.exams.push(newExam);

        await student.save();

        return res.status(200).json({
            status: true,
            message: 'Exam added successfully',
            data: student,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while adding exam',
        });
    }
};

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student by ID
 *     description: Deletes a student from the database by their unique ID.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the student to be deleted.
 *         required: true
 *         schema:
 *           type: string
 *           example: "60d2a92ef1b72c6e6f4f3b2c"
 *     responses:
 *       200:
 *         description: Successfully deleted the student.
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
 *                   example: "Student deleted successfully"
 *       404:
 *         description: Student not found.
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
 *                   example: "Student not found"
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
 *                   example: "Error while deleting student"
 */


export const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const db = req.db;
        const Student = await StudentModel(db);
        const deletedStudent = await Student.findByIdAndDelete(studentId);
        
        if (!deletedStudent) {
            return res.status(404).json({
                status: false,
                message: 'Student not found',
            });
        }
        return res.status(200).json({
            status: true,
            message: 'Student deleted successfully',
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while deleting student',
        });
    }
};
