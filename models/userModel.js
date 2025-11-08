import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    age: {
        type: Number,
        required: true,
    },
    symptoms: {
        type: [String],
        required: false
    },
    medicalIssue: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        max: 10,
        min: 10
    }
});

const userModel = mongoose.model("user", userSchema);
export default userModel;