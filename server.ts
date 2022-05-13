import express from 'express'
import mongoose from 'mongoose'
import bodyparser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import image from './routes/image'

const app = express();

app.use(cors())
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}))
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', image)

//connect database
try {
    mongoose.connect("mongodb://localhost:27017/GalleryDataBase");
    console.log(`Database is connected...`);
} catch (error) {
    console.log(`Database is not connected...`, error);
}

const PORT: number = 5000
app.listen(PORT,() => {
    console.log(`server is running on port ${PORT}`);
})