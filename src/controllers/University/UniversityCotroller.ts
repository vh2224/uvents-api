import { Request, Response } from 'express';

import { PrismaClient, University } from "@prisma/client";

const prisma = new PrismaClient();

import AppError from '../../errors/AppError';

class UniversityCotroller {

  async find(req: Request, res: Response) {    

    const universities = await prisma.university.findMany({
      include: {
        campus: {
         include: {
           course: true,
           state: true,
         } 
        }
      }
    });  

    return res.json(universities);
  }

  async create(req: Request, res: Response) {
    const { name }: University = req.body;

    const isExists = await prisma.university.findFirst({
      where: {
        name: name,
      }
    });

    if (isExists) throw new AppError(`${isExists.name} já cadastrado(a).`);

    const university = await prisma.university.create({
      data: {
        name: name,
      },
    });

    return res.json(university);
  }

  async update(req: Request, res: Response) {

    const { id } = req.params;
    const { name }: University =  req.body;

    const isExists = await prisma.university.findUnique({
      where: {
        id: id,
      }
    });

    if (!isExists) throw new AppError(`universityId: ${id} - não encontrado(a).`);

    const university = await prisma.university.update({
      data: {
        name: name,
      },
      where: {
        id: id,
      },
    });

    return res.json(university);
  
  }

}

export default UniversityCotroller;