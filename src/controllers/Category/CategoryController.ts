import { Request, Response } from 'express';

import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

import AppError from '../../errors/AppError';

class CategoryController {

  async find(req: Request, res: Response) {    

    const categories = await prisma.category.findMany();  

    return res.status(200).json(categories);
  }

  async create(req: Request, res: Response) {
    const { name, slug }: Category = req.body;

    const isExists = await prisma.category.findFirst({
      where: {
        name: name,
      }
    });

    if (isExists) throw new AppError(`${isExists.name} já cadastrado(a).`);

    const category = await prisma.category.create({
      data: {
        name: name,
        slug: slug,
      },
    });

    return res.json(category);
  }

  async update(req: Request, res: Response) {

    const { id } = req.params;
    const { name, slug }: Category = req.body;

    const isExists = await prisma.category.findUnique({
      where: {
        id: id,
      }
    });

    if (!isExists) throw new AppError(`categoryId: ${id} - não encontrado(a).`);

    const category = await prisma.category.update({
      data: {
        name: name,
        slug: slug,
      },
      where: {
        id: id,
      },
    });

    return res.json(category);
  
  }

}

export default CategoryController;