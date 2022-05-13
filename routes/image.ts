import express from 'express'
import multer from 'multer'
import path from 'path'
import Image from '../models/Image'
import validator from "validator"
import fs from 'fs'
const router = express.Router()


const storage = multer.diskStorage({
    destination: "public",
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const filter = (file: any, cb: any) => {
    const fileType = /jpeg|png|jpg/
    const extname = fileType.test(path.extname(file.originalname))
    if (extname) {
        cb(null, true)
    } else {
        return cb (new Error('Invalid extension'))
    }
}

const upload = multer({ 
    storage: storage, 
    fileFilter: (req, file, cb) => { filter(file, cb) },
    limits: {fileSize: 1000000}
})

const isEmpty = (value : any) => {
    return (
    value === undefined || 
    value === null || 
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
)}

function ValidateImage(req: any) {
    interface Errors {
        title?: string, 
        image?: string,
        path?: string
    }
    let errors : Errors = {};
    req.body.title = !isEmpty(req.body.title) ? req.body.title : "";
    req.file = !isEmpty(req.file) ? req.file : "";

    if (validator.isEmpty(req.body.title)) {
        errors.title = "Title is Required";
    }
    if (!req.file.filename) {
        errors.image = "Image is required";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};


router.post('/image', async (req, res) => {
    try {
        upload.single('image')(req, res, async (err) => {
            const {errors, isValid} = ValidateImage(req)
            if (err) {
                return res.status(400).json(err)
            } else {
                if (!isValid) {
                    return res.status(401).json(errors)
                } else {
                    const image = {
                        title: req.body.title,
                        image: req.file?.filename,
                        path: 'http://localhost:5000/' + req.file?.filename
                    }
                    await Image.create(image)
                    await Image.find().then(result => {
                        res.status(200).json(result)
                    })
                }
            }
        })
    } catch (error: any) {
        res.status(500).json({message: error.message})
    }
})

router.get('/', async (req, res) => {
    try {
        const images = await Image.find()
        res.status(200).json(images)
    } catch (error: any) {
        res.status(500).json({message: error.message})
    }
})

router.delete('/delete/:_id', async (req, res) => {
    try {
        const { _id } = req.params
    const image = await Image.findOne({_id})
    const link = path.join(__dirname, "../public", image.path.split('http://localhost:5000/')[1].toString())
    
    await fs.unlink(link, async (err) => {
        await Image.findByIdAndRemove({_id})
        .then(async () => {
            await Image.find()
            .then(data => {
                res.status(200).json({message: "image deleted", data})
            })
        })
    })
    } catch (error : any) {
        res.status(500).json({message: error.message})
    }
})


export default router