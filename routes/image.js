"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const Image_1 = __importDefault(require("../models/Image"));
const validator_1 = __importDefault(require("validator"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: "public",
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});
const filter = (file, cb) => {
    const fileType = /jpeg|png|jpg/;
    const extname = fileType.test(path_1.default.extname(file.originalname));
    if (extname) {
        cb(null, true);
    }
    else {
        return cb(new Error('Invalid extension'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => { filter(file, cb); },
    limits: { fileSize: 1000000 }
});
const isEmpty = (value) => {
    return (value === undefined ||
        value === null ||
        (typeof value === "object" && Object.keys(value).length === 0) ||
        (typeof value === "string" && value.trim().length === 0));
};
function ValidateImage(req) {
    let errors = {};
    req.body.title = !isEmpty(req.body.title) ? req.body.title : "";
    req.file = !isEmpty(req.file) ? req.file : "";
    if (validator_1.default.isEmpty(req.body.title)) {
        errors.title = "Title is Required";
    }
    if (!req.file.filename) {
        errors.image = "Image is required";
    }
    return {
        errors,
        isValid: isEmpty(errors),
    };
}
;
router.post('/image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        upload.single('image')(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const { errors, isValid } = ValidateImage(req);
            if (err) {
                return res.status(400).send(err.message);
            }
            else {
                if (!isValid) {
                    return res.status(401).json(errors);
                }
                else {
                    const image = {
                        title: req.body.title,
                        image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename,
                        path: 'http://localhost:5000/' + ((_b = req.file) === null || _b === void 0 ? void 0 : _b.filename)
                    };
                    yield Image_1.default.create(image);
                    yield Image_1.default.find().then(result => {
                        res.status(200).json(result);
                    });
                }
            }
        }));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield Image_1.default.find();
        res.status(200).json(images);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.delete('/delete/:_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.params;
        const image = yield Image_1.default.findOne({ _id });
        const link = path_1.default.join(__dirname, "../public", image.path.split('http://localhost:5000/')[1].toString());
        yield fs_1.default.unlink(link, (err) => __awaiter(void 0, void 0, void 0, function* () {
            yield Image_1.default.findByIdAndRemove({ _id })
                .then(() => __awaiter(void 0, void 0, void 0, function* () {
                yield Image_1.default.find()
                    .then(data => {
                    res.status(200).json({ message: "image deleted", data });
                });
            }));
        }));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
