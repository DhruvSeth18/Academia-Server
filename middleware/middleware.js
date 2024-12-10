import ConnectionToDatabase from "../Database/connection.js";

const ConnectionToSpecificDatabase = async (req,res,next)=>{
    try{
        if(req.headers.code){
            const db = await ConnectionToDatabase(process.env.DB_username,process.env.DB_password,req.headers.code); 
            req.db = db;
            console.log("Database connected to " + process.env.DB_username +" "+  process.env.DB_password + " "+ req.headers.code);
        } else{
            return res.status(400).json({
                status:"fail",
                message:"No school Code found in req.headers"
            });
        }
        next();
    } catch(error){
        console.log(error);
        return res.status(500).json({
            status:"fail", 
            message:"Error while connecting to specific Database"
        })
    }
}

export default ConnectionToSpecificDatabase;