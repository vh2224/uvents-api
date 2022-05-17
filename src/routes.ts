import { Router, urlencoded } from "express";

import multer from "multer";

import { celebrate, Joi, Segments } from "celebrate";
import { messages } from 'joi-translation-pt-br';

import UserController from "./controllers/User/UserController";
import CourseController from "./controllers/Course/CourseController";
import CampusController from "./controllers/Campus/CampusCotroller";
import UniverityController from "./controllers/University/UniversityCotroller";
import CategoryController from "./controllers/Category/CategoryController";
import MyAttendanceController from "./controllers/MyAttendance/MyAttendance";

import verifyJWT from "./services/verifyJwt";
import uploadImage from "./services/firebase";
import authService from "./services/authService";

import { ERole, EStatus } from "@prisma/client";

const router = Router();

const Multer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 1024 * 1024 * 4, // 4mb
  },
});

const userController = new UserController();

const courseController = new CourseController();

const campusController = new CampusController();

const univerityController = new UniverityController();

const categoryController = new CategoryController();

const myAttendance = new MyAttendanceController();


//Auth

router.post('/auth', userController.auth);


// User

router.get('/users', authService(['superadmin', 'admin', 'coordinator']), 
  celebrate({
    [Segments.PARAMS]: {
      search: Joi.string(),
    }
  }, { abortEarly: false, messages: messages }),
 userController.getUsers);

router.post('/users', 
  authService(['superadmin', 'admin', 'coordinator']), 
  urlencoded({ extended: true }),
  celebrate({
    [Segments.BODY]: {
      matricula: Joi.string().min(3).required(),
      password: Joi.string().min(3).required(),
      name: Joi.string().min(3).required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      role: Joi.string().valid(...Object.values(ERole)),
      courseId: Joi.string().guid().required(),
    }
  }, { abortEarly: false, messages: messages }),
  userController.create);

router.put('/users', celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(3).required(),
  }
}), userController.updateUser);

router.put('/users/avatar', verifyJWT, Multer.single('photoUrl'), uploadImage, userController.updateUserAvatar);

router.delete('/users', userController.deleteUser);


// Courses

router.get('/courses', verifyJWT, authService(['superadmin', 'admin', 'coordinator']), courseController.getAllCourses);

router.post('/courses', 
  verifyJWT, 
  authService(['superadmin', 'admin']),
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(5).required(),
      campusId: Joi.string().guid().required(),
  }},
{ abortEarly: false, messages: messages }), courseController.createCourse);

router.get('/courses/categories', courseController.getCourseCategories);


// Campus

router.get('/campus', campusController.find);

router.post('/campus', 
  authService(['superadmin', 'admin']), 
  Multer.single('file'),
  celebrate({
    [Segments.BODY]: {
      slogan: Joi.string().min(5).required(),
      cep: Joi.string().pattern(new RegExp('[0-9]{5}-[0-9]{3}')).required(),
      logradouro: Joi.string().min(5).required(),
      number: Joi.number().min(1).required(),
      district: Joi.string().min(4).required(),
      city: Joi.string().min(4).required(),
      phone: Joi.number().integer().min(1000000000).max(9999999999).required(),
      siteUrl: Joi.string().pattern(new RegExp('((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)')).required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      logo: Joi.string().min(10).required(),
      primaryColor: Joi.string().allow(null, ''),
      secundaryColor: Joi.string().allow(null, ''),
      tertiaryColor: Joi.string().allow(null, ''),
      universityId: Joi.string().guid().required(),
      stateId: Joi.string().guid().required(),
    }
  }, 
{ abortEarly: false, messages: messages }), campusController.create);

export { router };


// University

router.get('/university', univerityController.find);

router.post('/university',
  authService(['superadmin', 'admin']), 
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(3).required(),
    },
  }, 
  { abortEarly: false, messages: messages }),
  univerityController.create);

router.patch('/university/:id',
  authService(['superadmin', 'admin']), 
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().guid().required(),
    },
    [Segments.BODY]: {
      name: Joi.string().min(3).required(),
    },
  }, 
  { abortEarly: false, messages: messages }),
  univerityController.update);

  // Category

router.get('/category', categoryController.find);

router.post('/category',
  authService(['superadmin', 'admin']), 
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().min(3).required(),
      slug: Joi.string().min(3).required(),
    },
  }, 
  { abortEarly: false, messages: messages }),
  categoryController.create);

router.patch('/category/:id',
  authService(['superadmin', 'admin']), 
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().guid().required(),
    },
    [Segments.BODY]: {
      name: Joi.string().min(3).required(),
      slug: Joi.string().min(3).required(),
    },
  }, 
  { abortEarly: false, messages: messages }),
  categoryController.update);

  // MyAttendance

router.get('/myAttendance', categoryController.find);

router.post('/myAttendance',
  authService(['superadmin', 'admin']), 
  celebrate({
    [Segments.BODY]: {
      eventId: Joi.string().guid().required(),
    },
  }, 
  { abortEarly: false, messages: messages }),
  categoryController.create);

router.patch('/myAttendance/:id',
  authService(['superadmin', 'admin']), 
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().guid().required(),
    },
    [Segments.BODY]: {
      eventId: Joi.string().guid().required(),
    },
  }, 
  { abortEarly: false, messages: messages }),
  categoryController.update);