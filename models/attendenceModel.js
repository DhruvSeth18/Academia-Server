import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    classId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class' 
    },
    date: { type: Date, 
        required: true, 
        unique: true 
    },
    presentStudents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student' 
    }],
    absentStudents: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student' 
    }],
});

const AttendanceModel =(db)=> db.model('attendance', attendanceSchema);
export default AttendanceModel;