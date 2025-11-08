import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
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
    }
});

const userModel = mongoose.model("user", userSchema);
export default userModel;