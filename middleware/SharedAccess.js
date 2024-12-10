import { promisify } from 'util';
import ConnectionToDatabase from '../Database/connection.js';
import jwt from 'jsonwebtoken';

const SharedAccess = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const role = req.cookies.role;

        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Token is missing"
            });
        }
        if (!role) {
            return res.status(401).json({
                status: false,
                message: "Role is missing"
            });
        }
        let secretKey;
        if (role === 'Head') {
            secretKey = process.env.jwt_secret_Head;
        } else if (role === 'Management') {
            secretKey = process.env.jwt_secret_Management;
        } else if (role === 'Teacher') {
            secretKey = process.env.jwt_secret_Teacher;
        } else if (role==='Student'){
            secretKey = process.env.jwt_secret_Student;
        } else {
            return res.status(400).json({   
                status: false,
                message: "Invalid Role, Access Denied"
            });
        }

        const verify = await promisify(jwt.verify)(token, secretKey);
        if (!verify) {
            return res.status(401).json({
                status: false,
                message: "JWT not verified"
            });
        }

        const db = await ConnectionToDatabase(process.env.DB_username, process.env.DB_password, verify.schoolCode);
        console.log(verify.schoolCode);
        req.schoolCode = verify.schoolCode;
        req.db = db;
        req.data = verify;
        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
}

export default SharedAccess;
