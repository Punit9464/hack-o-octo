import mongoose, { Schema } from 'mongoose';
const hospitalSchema = new Schema({
    location: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true 
    }
});

const hospitalModel = mongoose.model("hostpital", hospitalSchema);
export default hospitalModel;