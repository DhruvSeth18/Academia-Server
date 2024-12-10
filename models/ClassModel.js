import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    className: { 
        type: String, 
        required: true,
        enum: ["Nursery", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],
    },
    classTeacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'teacher'
    },
    sectionName: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E'],
        required: true
    },
    resources:[{
        title:{
            type:String
        },
        link:{
            type:String
        }
    }],
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'student'
    }]
});


const ClassModel =(db)=> db.model('class', classSchema);
export default ClassModel;