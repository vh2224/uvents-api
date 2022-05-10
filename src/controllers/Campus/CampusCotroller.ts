import { Request, Response } from 'express';

import jwt_decode from "jwt-decode";

import { PrismaClient, Campus } from "@prisma/client";
const prisma = new PrismaClient();

import AppError from '../../errors/AppError';

import { IJWTDecodedProps } from '../../services/verifyJwt';

class CampusController {

  async find(req: Request, res: Response) {    
    const { matricula, userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);

    const campus = await prisma.campus.findMany({
      include: {
        university: true
      }
    });  

    return res.status(200).json(campus);
  }

  async create(req: Request, res: Response) {
    const { slogan, cep, logradouro, number, district, city, phone, siteUrl, email, logo, certificateTemplate, primaryColor, secundaryColor, tertiaryColor, universityId, stateId }: Campus = req.body;

    const isValidUniversity = await prisma.university.findFirst({
      where: {
        id: universityId,
      }
    });

    if (!isValidUniversity) {
      throw new AppError('Universidade ID não encontrado.', 400);
    }

    const isValidState = await prisma.state.findFirst({
      where: {
        id: stateId,
      }
    });

    if (!isValidState) throw new AppError('Estado ID não encontrado.', 400);

    const isExists = await prisma.campus.findFirst({
      where: {
        AND: {
          slogan: slogan,
          universityId: universityId,
        }
      },
      select: {
        slogan: true,
        university: true,
      }
    });

    if (isExists) throw new AppError(`Campus ${isExists.slogan} já cadastrado para ${isExists.university.name}`, 400);

    const campus = await prisma.campus.create({
      data: {
        slogan: slogan,
        cep: cep,
        logradouro: logradouro,
        number: String(number),
        district: district,
        city: city,
        phone: String(phone),
        siteUrl: siteUrl,
        email: email,
        logo: logo,
        certificateTemplate: certificateTemplate,
        universityId: universityId,
        stateId: stateId,
      },
    });

    return res.json(campus);
  }

}

export default CampusController;