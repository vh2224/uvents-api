"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const uuid_1 = require("uuid");
var serviceAccount = require("../config/firebase-key.json");
const AppError_1 = __importDefault(require("../errors/AppError"));
const FIREBASE_BUCKET_URL = process.env.FIREBASE_BUCKET_URL;
const DEFAULT_STORAGE_URL = process.env.DEFAULT_STORAGE_URL;
const MAX_SIZE_IMAGE = 1024 * 2; // 2MB
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: FIREBASE_BUCKET_URL,
});
const bucket = firebase_admin_1.default.storage().bucket();
const uploadImage = (req, res, next) => {
    const isAvatar = req.path.includes('/avatar');
    const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
    if (!req.file)
        throw new AppError_1.default('Você precisa inserir uma imagem válida.', 400);
    const { originalname, mimetype, buffer, size } = req.file;
    if (originalname.match(/\.(jpeg|jpg|gif|png|pdf)$/) == null) {
        throw new AppError_1.default(`O arquivo enviado precisa ser uma imagem ou pdf.`);
    }
    if (Number((size / 1024).toFixed(2)) > MAX_SIZE_IMAGE) {
        throw new AppError_1.default(`O certificado submetido é maior do que ${MAX_SIZE_IMAGE / 1024}MB, por favor, comprima sua imagem antes de envia-la.`);
    }
    let newFileName = matricula + '/degree/' + (0, uuid_1.v4)() + '.' + originalname.trim().split('.').pop();
    if (isAvatar) {
        newFileName = matricula + '/avatar/' + matricula + '.' + originalname.trim().split('.').pop();
    }
    const file = bucket.file(newFileName);
    const stream = file.createWriteStream({
        metadata: {
            contentType: mimetype,
        }
    });
    stream.on('error', (e) => {
        console.log(e);
        throw new AppError_1.default('Algo deu errado ao tentar submeter sua imagem.', 500);
    });
    stream.on('finish', async () => {
        // Change privace image to public
        await file.makePublic();
        // Get public url 
        req.params.firebaseUrl = DEFAULT_STORAGE_URL + '/' + FIREBASE_BUCKET_URL + '/' + newFileName;
        next();
    });
    stream.end(buffer);
};
exports.default = uploadImage;
