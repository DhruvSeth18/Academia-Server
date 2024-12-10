import ClassModel from '../models/ClassModel.js';
import TeacherModel from '../models/teacherModel.js';


/**
 * @swagger
 * /api/teachers:
 *   post:
 *     summary: Add a new teacher
 *     description: Creates a new teacher and assigns them to a specific class and section.
 *     tags:
 *       - Teachers
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               className:
 *                 type: string
 *                 example: "10th Grade"
 *               sectionName:
 *                 type: string
 *                 example: "A"
 *     responses:
 *       201:
 *         description: Teacher created successfully.
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
 *                   example: "Teacher created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d7f7f03b5f560018cd5f44"
 *                     username:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     subject:
 *                       type: string
 *                       example: "Mathematics"
 *       400:
 *         description: Missing required fields or teacher already exists.
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
 *                   example: "All fields are required"
 *       404:
 *         description: Class not found for the given className and sectionName.
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
 *                   example: "Class not found for the given className and sectionName"
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
 *                   example: "Error while creating teacher"
 */

export const addTeacher = async (req, res) => {
    try {
        const { username, email, password, subject, className, sectionName } = req.body;
        const schoolCode = req.schoolCode;
        console.log("here is some ",req.body);

        if (!username || !email || !password || !subject || !className || !sectionName || !schoolCode) {
            return res.status(400).json({
                status: false,
                message: 'All fields are required',
            });
        }

        const db = req.db;
        const Teacher = await TeacherModel(db);
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({
                status: false,
                message: 'Teacher already exists with this email',
            });
        }

        const Class = await ClassModel(db);
        const classData = await Class.findOne({ className, sectionName });

        if (!classData) {
            return res.status(404).json({
                status: false,
                message: 'Class not found for the given className and sectionName',
            });
        }

        const newTeacher = new Teacher({
            username,
            email,
            password,
            class:classData._id,
            subject,
            schoolCode,
        });

        classData.classTeacher = newTeacher._id;

        await classData.save();
        await newTeacher.save();

        return res.status(201).json({
            status: true,
            message: 'Teacher created successfully',
            data: newTeacher,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while creating teacher',
        });
    }
};

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers
 *     description: Fetches a list of all teachers, including their associated class details.
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched the list of teachers.
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
 *                       _id:
 *                         type: string
 *                         example: "60d7f7f03b5f560018cd5f44"
 *                       username:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "john.doe@example.com"
 *                       subject:
 *                         type: string
 *                         example: "Mathematics"
 *                       class:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d7f8a23b5f560018cd5f50"
 *                           className:
 *                             type: string
 *                             example: "10th Grade"
 *                           sectionName:
 *                             type: string
 *                             example: "A"
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
 *                   example: "Error while fetching teachers"
 */


export const getTeachers = async (req, res) => {
    try {
        const db = req.db;
        const Teacher = TeacherModel(db);
        const Class = ClassModel(db);
        await db.model('class', Class.schema);
        const teachers = await Teacher.find().populate('class');

        return res.status(200).json({
            status: true,
            data: teachers,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while fetching teachers',
        });
    }
};


/**
 * @swagger
 * /api/teacher/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     description: Fetches details of a specific teacher by their ID, including the classes they are associated with.
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the teacher to retrieve.
 *         schema:
 *           type: string
 *           example: "60d7f7f03b5f560018cd5f44"
 *     responses:
 *       200:
 *         description: Successfully fetched teacher details.
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
 *                     _id:
 *                       type: string
 *                       example: "60d7f7f03b5f560018cd5f44"
 *                     username:
 *                       type: string
 *                       example: "Jane Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "jane.doe@example.com"
 *                     subject:
 *                       type: string
 *                       example: "Science"
 *                     classes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d7f8a23b5f560018cd5f50"
 *                           className:
 *                             type: string
 *                             example: "9th Grade"
 *                           sectionName:
 *                             type: string
 *                             example: "B"
 *       404:
 *         description: Teacher not found.
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
 *                   example: "Teacher not found"
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
 *                   example: "Error while fetching teacher"
 */


export const getTeacherById = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const db = req.db;
        const Teacher = await TeacherModel(db);
        const teacher = await Teacher.findById(teacherId).populate('classes');

        if (!teacher) {
            return res.status(404).json({
                status: false,
                message: 'Teacher not found',
            });
        }

        return res.status(200).json({
            status: true,
            data: teacher,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while fetching teacher',
        });
    }
};

/**
 * @swagger
 * /api/teacher/{id}:
 *   put:
 *     summary: Update teacher details
 *     description: Updates a teacher's details, including assigning them to a class if valid class details are provided.
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the teacher to update.
 *         schema:
 *           type: string
 *           example: "60d7f7f03b5f560018cd5f44"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.smith@example.com"
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               className:
 *                 type: string
 *                 example: "10th Grade"
 *               sectionName:
 *                 type: string
 *                 example: "A"
 *     responses:
 *       200:
 *         description: Teacher updated successfully.
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
 *                   example: "Teacher updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d7f7f03b5f560018cd5f44"
 *                     username:
 *                       type: string
 *                       example: "Jane Smith"
 *                     email:
 *                       type: string
 *                       example: "jane.smith@example.com"
 *                     subject:
 *                       type: string
 *                       example: "Mathematics"
 *                     class:
 *                       type: string
 *                       example: "60d7f8a23b5f560018cd5f50"
 *       400:
 *         description: Invalid class details or missing required fields.
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
 *                   example: "className and sectionName are required"
 *       404:
 *         description: Teacher not found.
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
 *                   example: "Teacher not found"
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
 *                   example: "Internal server error while updating teacher"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */


export const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const updates = req.body;
        const db = req.db;
        const Class = await ClassModel(db);
        const Teacher = await TeacherModel(db);

        // Validate required fields for class details
        const { className, sectionName } = updates;
        if (!className || !sectionName) {
            return res.status(400).json({
                status: false,
                message: "className and sectionName are required",
            });
        }

        // Check if the provided class and section exist in the database
        const checkClass = await Class.findOne({ className, sectionName });
        if (!checkClass) {
            return res.status(400).json({
                status: false,
                message: "Class details are invalid",
            });
        }

        // Assign the valid class ID to the teacher's update object
        updates.class = checkClass._id;
        // checkClass.classTeacher

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updates,
            { new: true, runValidators: true }
        );

        // Handle the case where the teacher is not found
        if (!updatedTeacher) {
            return res.status(404).json({
                status: false,
                message: "Teacher not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Teacher updated successfully",
            data: updatedTeacher,
        });
    } catch (error) {
        console.error("Error while updating teacher:", error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error while updating teacher",
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/teacher/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     description: Deletes a teacher by their unique ID.
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the teacher to delete.
 *         schema:
 *           type: string
 *           example: "60d7f7f03b5f560018cd5f44"
 *     responses:
 *       200:
 *         description: Teacher deleted successfully.
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
 *                   example: "Teacher deleted successfully"
 *       404:
 *         description: Teacher not found.
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
 *                   example: "Teacher not found"
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
 *                   example: "Error while deleting teacher"
 */


export const deleteTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const db = req.db;
        const Teacher = await TeacherModel(db);
        const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

        if (!deletedTeacher) {
            return res.status(404).json({
                status: false,
                message: 'Teacher not found',
            });
        }
        
        return res.status(200).json({
            status: true,
            message: 'Teacher deleted successfully',
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while deleting teacher',
        });
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   post:
 *     summary: Add a resource to a class
 *     description: Adds a new resource (title and link) to a specific class by class ID.
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the class to which the resource will be added.
 *         schema:
 *           type: string
 *           example: "60d7f7f03b5f560018cd5f44"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Introduction to Algebra"
 *               link:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/algebra-intro"
 *     responses:
 *       200:
 *         description: Resource added successfully.
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
 *                   example: "Resource added successfully"
 *       400:
 *         description: Missing fields or resource link already exists.
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
 *                   example: "Link or Title is missing"
 *       404:
 *         description: Class not found.
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
 *                   example: "Class not found"
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
 *                   example: "Error while adding resources"
 */

export const addResources = async (req, res) => {
    try {
        const { title, link } = req.body;
        if(!title || !link){
            return res.status(400).json({
                status:false,
                message:"Link or Title is missing"
            })
        }
        const db = req.db;
        const classId = req.params.id;
        const Class = await ClassModel(db);
        const foundClass = await Class.findById(classId);

        if (!foundClass) {
            return res.status(404).json({
                status: false,
                message: 'Class not found',
            });
        }

        const resourceExists = foundClass.resources.some(resource => resource.link === link);

        if (resourceExists) {
            return res.status(400).json({
                status: false,
                message: 'Resource link already exists',
            });
        }

        foundClass.resources.push({ title, link });

        await foundClass.save();

        return res.status(200).json({
            status: true,
            message: 'Resource added successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Error while adding resources',
        });
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Get resources for a class
 *     description: Retrieves the list of resources for a specific class by class ID.
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the class whose resources are to be retrieved.
 *         schema:
 *           type: string
 *           example: "60d7f7f03b5f560018cd5f44"
 *     responses:
 *       200:
 *         description: List of resources retrieved successfully.
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
 *                       title:
 *                         type: string
 *                         example: "Introduction to Algebra"
 *                       link:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/algebra-intro"
 *       404:
 *         description: Class not found.
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
 *                   example: "Class not found"
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
 *                   example: "Error while fetching resources"
 */

export const getResources = async (req,res)=>{
    try{
        const db = req.db;
        const classId = req.params.id;
        const Class = await ClassModel(db);
        const foundClass = await Class.findById(classId);
        return res.status(200).json({
            status: true,
            data:foundClass.resources
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            status: false,
            message: 'Error while adding resources',
        });
    }
}