"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const AppError_1 = __importDefault(require("../../errors/AppError"));
class CourseController {
    async getAllCourses(req, res) {
        const categories = await prisma.course.findMany();
        return res.status(200).json(categories);
    }
    async getCourseCategories(req, res) {
        const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const course = await prisma.user.findFirst({
            where: {
                matricula: matricula,
            },
            select: {
                courseId: true,
            }
        });
        const categoriesOfCourse = await prisma.complementaryActivityCategory.findMany({
            where: {
                AND: {
                    CourseCategoryActivitie: {
                        some: {
                            courseId: course.courseId,
                        }
                    },
                    isActive: true,
                }
            }
        });
        if (!categoriesOfCourse) {
            throw new AppError_1.default('Desculpe, nenhuma categoria encontrada.', 404);
        }
        return res.status(200).json(categoriesOfCourse);
    }
    async createCourse(req, res) {
        const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const { name, totalHoursToComplete, campusId } = req.body;
        const courseIsExists = await prisma.course.findFirst({
            where: {
                AND: {
                    name: name,
                    campusId: campusId,
                }
            }
        });
        if (courseIsExists) {
            throw new AppError_1.default('Curso já existente neste campus.', 400);
        }
        const course = await prisma.course.create({
            data: {
                name: name,
                totalHoursToComplete: totalHoursToComplete,
                campusId: campusId,
            }
        });
        return res.status(200).json(course);
    }
}
exports.default = CourseController;
