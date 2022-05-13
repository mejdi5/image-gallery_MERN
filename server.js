"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const image_1 = __importDefault(require("./routes/image"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/api', image_1.default);
//connect database
try {
    mongoose_1.default.connect("mongodb://localhost:27017/GalleryDataBase");
    console.log(`Database is connected...`);
}
catch (error) {
    console.log(`Database is not connected...`, error);
}
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
