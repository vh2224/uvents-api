import {Request, Response, NextFunction}  from 'express';

import admin from 'firebase-admin';
import jwt_decode from "jwt-decode";
import { IJWTDecodedProps } from './verifyJwt';
import { v4 as uuidv4 } from 'uuid';

var serviceAccount = require("../config/firebase-key.json");
 
import AppError from '../errors/AppError';

const FIREBASE_BUCKET_URL = process.env.FIREBASE_BUCKET_URL; 
const DEFAULT_STORAGE_URL = process.env.DEFAULT_STORAGE_URL;

const MAX_SIZE_IMAGE = 1024 * 2; // 2MB

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: FIREBASE_BUCKET_URL,
});

const bucket = admin.storage().bucket();

const uploadImage = (req: Request, res: Response, next: NextFunction) => {

  const isAvatar = req.path.includes('/avatar');

  const { matricula , userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);

  if (!req.file) throw new AppError('Você precisa inserir uma imagem válida.', 400);

  const { originalname, mimetype, buffer, size } = req.file;

  if (originalname.match(/\.(jpeg|jpg|gif|png|pdf)$/) == null) {
    throw new AppError(`O arquivo enviado precisa ser uma imagem ou pdf.`)
  }  

  if (Number((size/1024).toFixed(2)) > MAX_SIZE_IMAGE) {
    throw new AppError(`O certificado submetido é maior do que ${MAX_SIZE_IMAGE / 1024}MB, por favor, comprima sua imagem antes de envia-la.`)
  }

  let newFileName = matricula + '/degree/' + uuidv4() + '.' + originalname.trim().split('.').pop();

  if(isAvatar) {
    newFileName = matricula + '/avatar/' + matricula + '.' + originalname.trim().split('.').pop();
  }

  const file = bucket.file(newFileName);

  const stream = file.createWriteStream({
    metadata: {
      contentType: mimetype,
    }
  });

  stream.on('error', (e: Error) => {
    console.log(e);
    throw new AppError('Algo deu errado ao tentar submeter sua imagem.', 500);
  });

  stream.on('finish', async () => {

    // Change privace image to public
    await file.makePublic();


    // Get public url 
    req.params.firebaseUrl = DEFAULT_STORAGE_URL + '/' + FIREBASE_BUCKET_URL + '/' + newFileName;

    next();
  });

  stream.end(buffer);
}

export default uploadImage;