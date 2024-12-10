import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import rateLimiter from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import SchoolHeadRoutes from './routes/SheadRoute.js';
import teacherRoutes from './routes/teacherRoute.js';
import studentRoutes from './routes/studentRoute.js';
import classRoutes from './routes/classRoutes.js';
import attendenceRoutes from './routes/attendenceRoutes.js';
import managementRoutes from './routes/managementRoute.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import cors from 'cors';

dotenv.config();
const app = express();

const limiter = rateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: "Two many request in 1 minute"
})

app.use(helmet());
app.use(
    cors({
        origin: ["https://academia-front-end.vercel.app","http://localhost:3000", "http://localhost:5173"],
        credentials: true
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);
app.use(cookieParser());


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'School Management API',
            description: 'API documentation for the School Management System',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:8000', // Adjust based on your local server
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js'], // Include all route and controller files
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', SchoolHeadRoutes);
app.use('/api', classRoutes);
app.use('/api', teacherRoutes);
app.use('/api', studentRoutes);
app.use('/api', attendenceRoutes);
app.use('/api', managementRoutes);

app.get('/',(req,res)=>{
    return res.status(200).json({
        status:"success",
        message:"website is working"
    })
});

const port = process.env.PORT || 8000;


app.listen(port, () => {
    console.log("App is running on the port " + port);
}) 