import { Request, Response } from 'express';

import jwt_decode from "jwt-decode";

import { PrismaClient, ComplementaryActivityCategory, ERole, User, Course } from "@prisma/client";

const prisma = new PrismaClient();

import AppError from '../../errors/AppError';

import { IJWTDecodedProps } from '../../services/verifyJwt';

class CourseController {

  async getAllCourses(req: Request, res: Response) {    
    const categories = await prisma.course.findMany();

    return res.status(200).json(categories);
  }

  async getCourseCategories(req: Request, res: Response) {    
    const { matricula, userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);
    
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
      throw new AppError('Desculpe, nenhuma categoria encontrada.', 404)
    }

    return res.status(200).json(categoriesOfCourse);
  }

  async createCourse(req: Request, res: Response) {
    const { matricula, userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);

    const { name, totalHoursToComplete, campusId }: Course = req.body;

    const courseIsExists = await prisma.course.findFirst({
      where: {
        AND: {
          name: name,
          campusId: campusId,
        }
      }
    });

    if (courseIsExists) {
      throw new AppError('Curso já existente neste campus.', 400);
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

export default CourseController;