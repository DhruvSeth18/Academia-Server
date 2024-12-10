import ClassModel from "../models/ClassModel.js";
import StudentModel from "../models/studentModel.js";
import TeacherModel from "../models/teacherModel.js";

/**
 * @swagger
 * /api/class:
 *   post:
 *     summary: Create a new class with multiple sections
 *     description: This endpoint allows creating a new class with specified sections (between 1 and 5). It checks for duplicate class-section combinations and ensures that the number of sections is valid.
 *     tags:
 *       - Classes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               className:
 *                 type: string
 *                 description: The name of the class (e.g., "Math 101").
 *               numSections:
 *                 type: integer
 *                 description: The number of sections to create (between 1 and 5).
 *     responses:
 *       201:
 *         description: Classes created successfully.
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
 *                   example: Classes created successfully
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       className:
 *                         type: string
 *                         description: The name of the class.
 *                         example: "Math 101"
 *                       schoolCode:
 *                         type: string
 *                         description: The unique code of the school.
 *                         example: "XYZ123"
 *                       sectionName:
 *                         type: string
 *                         description: The section name (e.g., "A", "B").
 *                         example: "A"
 *                       students:
 *                         type: array
 *                         description: List of students in the class (empty initially).
 *                         items:
 *                           type: object
 *       400:
 *         description: Invalid input or duplicate class-section combinations.
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
 *                   example: "className, schoolCode, and numSections are required"
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
 *                   example: "Error while creating classes"
 */


export const createClass = async (req, res) => {
    try {
        const { className, numSections } = req.body;
        const schoolCode = req.schoolCode;
        console.log("data is here ", className);
        if (!className || !schoolCode || !numSections) {
            return res.status(400).json({
                status: false,
                message: "className, schoolCode, and numSections are required",
            });
        }

        const db = req.db;
        const Class = await ClassModel(db);

        // Validate the number of sections
        if (numSections < 1 || numSections > 5) {
            return res.status(400).json({
                status: false,
                message: "numSections must be between 1 and 5",
            });
        }

        // Sections to create, e.g., ["A", "B", "C", "D", "E"] for numSections = 5
        const sections = ["A", "B", "C", "D", "E"].slice(0, numSections);

        // Check for any duplicate class-section combinations
        const existingClasses = await Class.find({
            className,
            sectionName: { $in: sections },
            schoolCode,
        });

        if (existingClasses.length > 0) {
            const existingSections = existingClasses.map((cls) => cls.sectionName).join(", ");
            return res.status(400).json({
                status: false,
                message: `Classes with sections ${existingSections} already exist`,
            });
        }

        // Create the classes
        const newClasses = sections.map((section) => ({
            className,
            schoolCode,
            sectionName: section,
            students: [],
        }));

        const createdClasses = await Class.insertMany(newClasses);

        return res.status(201).json({
            status: true,
            message: "Classes created successfully",
            classes: createdClasses,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Error while creating classes",
        });
    }
};


/**
 * @swagger
 * /api/class:
 *   get:
 *     summary: Get a list of all class names
 *     description: This endpoint retrieves a list of all unique class names from the database.
 *     tags:
 *       - Classes
 *     responses:
 *       200:
 *         description: A list of all class names.
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
 *                     type: string
 *                     description: A unique class name.
 *                     example: "Math 101"
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
 *                   example: "Failed to fetch classes"
 */


export const getAllClasses = async (req, res) => {
    try {
        const db = req.db;
        const Class = await ClassModel(db);
        const classes = await Class.find().distinct('className');
        return res.status(200).json({ 
            status: true, 
            data: classes 
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ 
            status: false, 
            message: 'Failed to fetch classes' 
        });
    }
};

/**
 * @swagger
 * /api/class/{className}/sections:
 *   get:
 *     summary: Get sections for a specific class
 *     description: This endpoint retrieves a list of all sections for a given class name.
 *     tags:
 *       - Classes
 *     parameters:
 *       - in: path
 *         name: className
 *         required: true
 *         description: The name of the class for which sections are to be fetched.
 *         schema:
 *           type: string
 *           example: "Math 101"
 *     responses:
 *       200:
 *         description: A list of sections for the specified class.
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
 *                     type: string
 *                     description: A unique section for the class.
 *                     example: "A"
 *       404:
 *         description: No sections found for the specified class.
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
 *                   example: "No sections found for the specified class"
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
 *                   example: "Failed to fetch sections"
 */


export const getSectionsByClass = async (req, res) => {
    const { className } = req.params;
    try {
        const db = req.db;
        const Class = await ClassModel(db);
        const sections = await Class.find({ className }).distinct('sectionName');
        if (sections.length === 0) {
            return res.status(404).json({ 
                status: false, 
                message: 'No sections found for the specified class' 
            });
        }
        res.status(200).json({ 
            status: true, 
            data: sections 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            status: false, 
            message: 'Failed to fetch sections', error 
        });
    }
};





/**
 * @swagger
 * /api/class/addTeacher:
 *   post:
 *     summary: Add a teacher to a class
 *     description: This endpoint allows adding a teacher to a specific class by updating both class and teacher data.
 *     tags:
 *       - Classes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *                 description: The unique identifier of the class to which the teacher is to be added.
 *                 example: "60d21b4667d0d8992e610c85"
 *               teacherId:
 *                 type: string
 *                 description: The unique identifier of the teacher to be added to the class.
 *                 example: "60d21b4667d0d8992e610c84"
 *     responses:
 *       200:
 *         description: Teacher successfully added to the class.
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
 *                   example: "Teacher added to class"
 *       400:
 *         description: Missing required fields in the request body.
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
 *                   example: "classId and teacherId are required"
 *       404:
 *         description: Class or Teacher not found.
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
 *                   example: "Class or Teacher not found"
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
 *                   example: "Error while adding teacher to class"
 */


export const addTeacherToClass = async (req, res) => {
    try {
        const { classId, teacherId } = req.body;
        const db = req.db;
        const Class = await ClassModel(db);
        const Teacher = await TeacherModel(db);
        const classData = await Class.findById(classId);
        const teacherData = await Teacher.findById(teacherId);

        if (!classData || !teacherData) {
            return res.status(404).json({
                status: false,
                message: "Class or Teacher not found",
            });
        }

        classData.teachers.push(teacherData._id);
        await classData.save();

        teacherData.classes.push(classData._id);
        await teacherData.save();

        return res.status(200).json({
            status: true,
            message: "Teacher added to class",
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: "Error while adding teacher to class",
        });
    }
};

/**
 * @swagger
 * /api/class/{classId}/students:
 *   get:
 *     summary: Get students of a specific class
 *     description: Fetches the list of students enrolled in a specific class using the classId.
 *     tags:
 *       - Classes
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         description: The unique identifier of the class whose students need to be fetched.
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Successfully fetched students for the class.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 class:
 *                   type: object
 *                   properties:
 *                     className:
 *                       type: string
 *                       description: The name of the class.
 *                       example: "Class 10A"
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                             description: The unique identifier of the student.
 *                             example: "60d21b4667d0d8992e610c87"
 *                           name:
 *                             type: string
 *                             description: The name of the student.
 *                             example: "John Doe"
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
 *                   example: "Error while fetching class details"
 */


export const getClassStudents = async (req, res) => {
    try {
        const classId = req.params.classId;
        const db = req.db;
        const Class = await ClassModel(db);
        const Student = await StudentModel(db);
        await db.model('students',Student.schema);
        const classData = await Class.findById(classId)
            .populate('students');

        if (!classData) {
            return res.status(404).json({
                status: false,
                message: "Class not found",
            });
        }

        return res.status(200).json({
            status: true,
            class: classData,
        });
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: "Error while fetching class details",
        });
    }
};

/**
 * @swagger
 * /api/class:
 *   put:
 *     summary: Update class details
 *     description: Updates the details of an existing class, including the class name and section.
 *     tags:
 *       - Classes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *                 description: The unique identifier of the class to be updated.
 *                 example: "60d21b4667d0d8992e610c85"
 *               name:
 *                 type: string
 *                 description: The new name of the class.
 *                 example: "Class 10B"
 *               section:
 *                 type: string
 *                 description: The new section of the class.
 *                 example: "B"
 *     responses:
 *       200:
 *         description: Successfully updated the class.
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
 *                   example: "Class updated successfully"
 *                 class:
 *                   type: object
 *                   properties:
 *                     classId:
 *                       type: string
 *                       description: The unique identifier of the updated class.
 *                       example: "60d21b4667d0d8992e610c85"
 *                     name:
 *                       type: string
 *                       description: The updated class name.
 *                       example: "Class 10B"
 *                     section:
 *                       type: string
 *                       description: The updated class section.
 *                       example: "B"
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
 *                   example: "Error while updating class"
 */


export const updateClass = async (req, res) => {
    try {
        const { classId, name, section } = req.body;
        const db = req.db;
        const Class = await ClassModel(db);
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { name, section },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({
                status: false,
                message: "Class not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Class updated successfully",
            class: updatedClass,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: "Error while updating class",
        });
    }
};

/**
 * @swagger
 * /api/class/{classId}:
 *   delete:
 *     summary: Delete a class
 *     description: Deletes the specified class by its unique classId.
 *     tags:
 *       - Classes
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         description: The unique identifier of the class to be deleted.
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Successfully deleted the class.
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
 *                   example: "Class deleted successfully"
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
 *                   example: "Error while deleting class"
 */


export const deleteClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        const db = req.db;
        const Class = await ClassModel(db);
        const deletedClass = await Class.findByIdAndDelete(classId);

        if (!deletedClass) {
            return res.status(404).json({
                status: false,
                message: "Class not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Class deleted successfully",
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: "Error while deleting class",
        });
    }
};
