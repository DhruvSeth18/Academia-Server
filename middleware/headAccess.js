import { promisify } from 'util';
import ConnectionToDatabase from '../Database/connection.js';
import jwt from 'jsonwebtoken';
const headAccesss = async (req,res,next)=>{
    try{
        const token = req.cookies.token;
        const role = req.cookies.role;

        if(!token){
            return res.status(401).json({
                status:true,
                message:"token is missing"
            })
        }
        if(!role){
            return res.status(401).json({
                status:false,
                message:"role is missing"
            }) 
        }
        if(role==='Head'){
            const verify = await promisify(jwt.verify)(token, process.env.jwt_secret_Head);
            if(!verify){
                return res.status(401).json({
                    status:false,
                    message:"JWT not verified"
                })
            }
            const db = await ConnectionToDatabase(process.env.DB_username,process.env.DB_password,verify.schoolCode);
            console.log(verify.schoolCode);
            req.schoolCode = verify.schoolCode;
            req.db = db;
            req.data = verify;
            next();
        } else{
            return res.status(400).json({
                status:false,
                message:"Invalid Role , Access Denied"
            })
        }
    } catch(error){
        console.log(error);
    }
}
export default headAccesss;