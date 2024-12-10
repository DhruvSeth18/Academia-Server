import ManagementModel from "../models/managementModel.js";


/**
 * @swagger
 * /api/management:
 *   post:
 *     summary: Add a new management person
 *     description: Adds a new management person to the system with username, email, password, and role.
 *     tags:
 *       - Management
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
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 example: "Manager"
 *     responses:
 *       201:
 *         description: Successfully added the management person.
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
 *                   example: "Management person added successfully"
 *       400:
 *         description: Bad request, required fields missing or email already exists.
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
 *                   example: "All fields are required (email, password, name, position)"
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
 *                   example: "Error while Adding Management Person"
 */

export const addManagement = async (req,res)=>{
    try{
        const {username , email, password, role} = req.body;
        const schoolCode = req.schoolCode;

        if(!email || !password || !username || !schoolCode){
            return res.status(400).json({
                status: false,
                message: 'All fields are required (email, password, name, position)',
            });
        }
        const db = req.db;
        const Management = await ManagementModel(db);
        const existingManagement = await Management.findOne({ email });
        if (existingManagement) {
            return res.status(400).json({
                status: false,
                message: 'Management person with this email already exists',
            });
        }
        const newManagement = new Management({
            username,
            schoolCode,
            email,
            password,
            role,
        });
        await newManagement.save(); 
        return res.status(201).json({
            status: true,
            message: 'Management person added successfully',
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            status:false,
            message:"Error while Adding Management Person",
        })
    }
}

/**
 * @swagger
 * /api/management/{managementId}:
 *   delete:
 *     summary: Remove a management person
 *     description: Deletes a specific management person based on their ID.
 *     tags:
 *       - Management
 *     parameters:
 *       - name: managementId
 *         in: path
 *         required: true
 *         description: The ID of the management person to be removed.
 *         schema:
 *           type: string
 *           example: "60d7f7f03b5f560018cd5f44"
 *     responses:
 *       200:
 *         description: Successfully removed the management person.
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
 *                   example: "Management person removed successfully"
 *       400:
 *         description: Management ID is required.
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
 *                   example: "Management ID is required"
 *       404:
 *         description: Management person not found.
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
 *                   example: "Management person not found"
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
 *                   example: "Error while removing management person"
 */


export const removeManagement = async (req, res) => {
    try {
        const managementId = req.params.managementId;
        if (!managementId) {
            return res.status(400).json({
                status: false,
                message: 'Management ID is required',
            });
        }
        const db = req.db;
        const Management = await ManagementModel(db);
        const management = await Management.findByIdAndDelete(managementId);
        if (!management) {
            return res.status(404).json({
                status: false,
                message: 'Management person not found',
            });
        }
        return res.status(200).json({
            status: true,
            message: 'Management person removed successfully',
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while removing management person',
        });
    }
};

/**
 * @swagger
 * /api/management/{managementId}:
 *   put:
 *     summary: Update a management person's details
 *     description: Updates the details of a specific management person based on their ID.
 *     tags:
 *       - Management
 *     parameters:
 *       - name: managementId
 *         in: path
 *         required: true
 *         description: The ID of the management person to be updated.
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
 *                 example: "JaneDoe"
 *               email:
 *                 type: string
 *                 example: "jane.doe@example.com"
 *               role:
 *                 type: string
 *                 example: "Head"
 *     responses:
 *       200:
 *         description: Successfully updated the management person.
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
 *                   example: "Management person updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d7f7f03b5f560018cd5f44"
 *                     username:
 *                       type: string
 *                       example: "JaneDoe"
 *                     email:
 *                       type: string
 *                       example: "jane.doe@example.com"
 *                     role:
 *                       type: string
 *                       example: "Head"
 *       400:
 *         description: Management ID is required.
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
 *                   example: "Management ID is required"
 *       404:
 *         description: Management person not found.
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
 *                   example: "Management person not found"
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
 *                   example: "Error while updating management person"
 */


export const updateManagement = async (req, res) => {
    try {
        const managementId = req.params.managementId;
        const updates = req.body;

        if (!managementId) {
            return res.status(400).json({
                status: false,
                message: 'Management ID is required',
            });
        }

        const db = req.db;
        const Management = await ManagementModel(db);
        const updatedManagement = await Management.findByIdAndUpdate(
            managementId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedManagement) {
            return res.status(404).json({
                status: false,
                message: 'Management person not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Management person updated successfully',
            data: updatedManagement,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while updating management person',
        });
    }
};


/**
 * @swagger
 * /api/management:
 *   get:
 *     summary: Get all management persons
 *     description: Retrieves all management persons from the system.
 *     tags:
 *       - Management
 *     responses:
 *       200:
 *         description: Successfully retrieved management persons.
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
 *                         example: "JohnDoe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       role:
 *                         type: string
 *                         example: "Manager"
 *       404:
 *         description: No management persons found.
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
 *                   example: "No management persons found"
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
 *                   example: "Error while getting management persons"
 */


export const getManager = async (req, res) => {
    try {
        const db = req.db;
        const Management = await ManagementModel(db);
        const managers = await Management.find();
        return res.status(200).json({
            status: true,
            data: managers,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: false,
            message: 'Error while getting management persons',
        });
    }
};