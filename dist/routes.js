"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const celebrate_1 = require("celebrate");
const joi_translation_pt_br_1 = require("joi-translation-pt-br");
const UserController_1 = __importDefault(require("./controllers/User/UserController"));
const CourseController_1 = __importDefault(require("./controllers/Course/CourseController"));
const CampusCotroller_1 = __importDefault(require("./controllers/Campus/CampusCotroller"));
const UniversityCotroller_1 = __importDefault(require("./controllers/University/UniversityCotroller"));
const CategoryController_1 = __importDefault(require("./controllers/Category/CategoryController"));
const EventController_1 = __importDefault(require("./controllers/Event/EventController"));
const verifyJwt_1 = __importDefault(require("./services/verifyJwt"));
const firebase_1 = __importDefault(require("./services/firebase"));
const authService_1 = __importDefault(require("./services/authService"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.router = router;
const Multer = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fieldSize: 1024 * 1024 * 4, // 4mb
    },
});
const userController = new UserController_1.default();
const courseController = new CourseController_1.default();
const campusController = new CampusCotroller_1.default();
const univerityController = new UniversityCotroller_1.default();
const categoryController = new CategoryController_1.default();
const eventController = new EventController_1.default();
//Auth
router.post('/auth', userController.auth);
// User
router.get('/users', (0, authService_1.default)(['superadmin', 'admin', 'coordinator']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.PARAMS]: {
        search: celebrate_1.Joi.string(),
    }
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), userController.getUsers);
router.post('/users', (0, authService_1.default)(['superadmin', 'admin', 'coordinator']), (0, express_1.urlencoded)({ extended: true }), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        matricula: celebrate_1.Joi.string().min(3).required(),
        password: celebrate_1.Joi.string().min(3).required(),
        name: celebrate_1.Joi.string().min(3).required(),
        email: celebrate_1.Joi.string().email({ minDomainSegments: 2 }).required(),
        role: celebrate_1.Joi.string().valid(...Object.values(client_1.ERole)),
        courseId: celebrate_1.Joi.string().guid().required(),
    }
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), userController.create);
router.put('/users', (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
    }
}), userController.updateUser);
router.put('/users/avatar', verifyJwt_1.default, Multer.single('photoUrl'), firebase_1.default, userController.updateUserAvatar);
router.delete('/users', userController.deleteUser);
router.get('/users/events', verifyJwt_1.default, (0, authService_1.default)(['superadmin', 'admin', 'coordinator', 'student']), userController.myEvents);
// Courses
router.get('/courses', verifyJwt_1.default, (0, authService_1.default)(['superadmin', 'admin', 'coordinator']), courseController.getAllCourses);
router.post('/courses', verifyJwt_1.default, (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(5).required(),
        campusId: celebrate_1.Joi.string().guid().required(),
    }
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), courseController.createCourse);
router.get('/courses/categories', courseController.getCourseCategories);
// Campus
router.get('/campus', campusController.find);
router.post('/campus', (0, authService_1.default)(['superadmin', 'admin']), Multer.single('file'), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        slogan: celebrate_1.Joi.string().min(5).required(),
        cep: celebrate_1.Joi.string().pattern(new RegExp('[0-9]{5}-[0-9]{3}')).required(),
        logradouro: celebrate_1.Joi.string().min(5).required(),
        number: celebrate_1.Joi.number().min(1).required(),
        district: celebrate_1.Joi.string().min(4).required(),
        city: celebrate_1.Joi.string().min(4).required(),
        phone: celebrate_1.Joi.number().integer().min(1000000000).max(9999999999).required(),
        siteUrl: celebrate_1.Joi.string().pattern(new RegExp('((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)')).required(),
        email: celebrate_1.Joi.string().email({ tlds: { allow: false } }).required(),
        logo: celebrate_1.Joi.string().min(10).required(),
        primaryColor: celebrate_1.Joi.string().allow(null, ''),
        secundaryColor: celebrate_1.Joi.string().allow(null, ''),
        tertiaryColor: celebrate_1.Joi.string().allow(null, ''),
        universityId: celebrate_1.Joi.string().guid().required(),
        stateId: celebrate_1.Joi.string().guid().required(),
    }
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), campusController.create);
// University
router.get('/university', univerityController.find);
router.post('/university', (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), univerityController.create);
router.patch('/university/:id', (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.PARAMS]: {
        id: celebrate_1.Joi.string().guid().required(),
    },
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), univerityController.update);
// Category
router.get('/category', categoryController.find);
router.post('/category', (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
        slug: celebrate_1.Joi.string().min(3).required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), categoryController.create);
router.patch('/category/:id', (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.PARAMS]: {
        id: celebrate_1.Joi.string().guid().required(),
    },
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
        slug: celebrate_1.Joi.string().min(3).required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), categoryController.update);
// Event
router.get('/event', eventController.find);
router.get('/event/:id', eventController.findById);
router.get('/categories/events', eventController.findEventsByCategories);
router.get('/categories/events/future', eventController.findFutureEventsByCategories);
router.post('/event', (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
        qrCodeUrl: celebrate_1.Joi.string().pattern(new RegExp('((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)')).required(),
        startDate: celebrate_1.Joi.date().min(5).required(),
        endDate: celebrate_1.Joi.date().min(5).required(),
        images: celebrate_1.Joi.string().min(10).required(),
        description: celebrate_1.Joi.string().min(10).required(),
        price: celebrate_1.Joi.number().min(1).required(),
        amoutHours: celebrate_1.Joi.number().min(1).required(),
        modality: celebrate_1.Joi.string().min(4).required(),
        meetingUrl: celebrate_1.Joi.string().pattern(new RegExp('((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)')).required(),
        userId: celebrate_1.Joi.string().guid().required(),
        cep: celebrate_1.Joi.string().pattern(new RegExp('[0-9]{5}-[0-9]{3}')).required(),
        logradouro: celebrate_1.Joi.string().min(5).required(),
        number: celebrate_1.Joi.number().min(1).required(),
        district: celebrate_1.Joi.string().min(4).required(),
        city: celebrate_1.Joi.string().min(4).required(),
        address: celebrate_1.Joi.string().min(5).required(),
        complement: celebrate_1.Joi.string().min(5),
        state: celebrate_1.Joi.string().min(3).required(),
        country: celebrate_1.Joi.string().min(4).required(),
        longitude: celebrate_1.Joi.string().min(5).required(),
        latitude: celebrate_1.Joi.string().min(5).required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), eventController.create);
router.patch('/event/:id', (0, authService_1.default)(['superadmin', 'admin']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.PARAMS]: {
        id: celebrate_1.Joi.string().guid().required(),
    },
    [celebrate_1.Segments.BODY]: {
        name: celebrate_1.Joi.string().min(3).required(),
        qrCodeUrl: celebrate_1.Joi.string().pattern(new RegExp('((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)')).required(),
        startDate: celebrate_1.Joi.date().min(5).required(),
        endDate: celebrate_1.Joi.date().min(5).required(),
        images: celebrate_1.Joi.string().min(10).required(),
        description: celebrate_1.Joi.string().min(10).required(),
        price: celebrate_1.Joi.number().min(1).required(),
        amoutHours: celebrate_1.Joi.number().min(1).required(),
        modality: celebrate_1.Joi.string().min(4).required(),
        meetingUrl: celebrate_1.Joi.string().pattern(new RegExp('((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)')).required(),
        userId: celebrate_1.Joi.string().guid().required(),
        cep: celebrate_1.Joi.string().pattern(new RegExp('[0-9]{5}-[0-9]{3}')).required(),
        logradouro: celebrate_1.Joi.string().min(5).required(),
        number: celebrate_1.Joi.number().min(1).required(),
        district: celebrate_1.Joi.string().min(4).required(),
        city: celebrate_1.Joi.string().min(4).required(),
        address: celebrate_1.Joi.string().min(5).required(),
        complement: celebrate_1.Joi.string().min(5),
        state: celebrate_1.Joi.string().min(3).required(),
        country: celebrate_1.Joi.string().min(4).required(),
        longitude: celebrate_1.Joi.string().min(5).required(),
        latitude: celebrate_1.Joi.string().min(5).required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), eventController.update);
// UsersEvents
router.get('/users/presence/event/:eventId', verifyJwt_1.default, (0, authService_1.default)(['superadmin', 'admin', 'student', 'coordinator']), eventController.countUsersPresenceConfirmation);
router.post('/users/events/:eventId', verifyJwt_1.default, (0, authService_1.default)(['superadmin', 'admin', 'student', 'coordinator']), (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.PARAMS]: {
        eventId: celebrate_1.Joi.string().guid().required(),
    },
    [celebrate_1.Segments.QUERY]: {
        latitude: celebrate_1.Joi.string().required(),
        longitude: celebrate_1.Joi.string().required(),
    },
}, { abortEarly: false, messages: joi_translation_pt_br_1.messages }), userController.registerEvents);
