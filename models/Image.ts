import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    title: String,
    image: String,
    path: String
}, {
    timestamps: true
});

export default mongoose.model("images", imageSchema);