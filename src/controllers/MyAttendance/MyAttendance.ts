import { Request, Response } from 'express';

import { PrismaClient, MyAttendance } from "@prisma/client";

const prisma = new PrismaClient();

import AppError from '../../errors/AppError';

class MyAttendanceController {

    async find(req: Request, res: Response) {
        const myAttendance = await prisma.myAttendance.findMany({
            include: {
                Event: true,
            }
        });

        return res.status(200).json(myAttendance);
    }

    async create(req: Request, res: Response) {
        const { eventId }: MyAttendance = req.body;

        const isValidEvent = await prisma.event.findFirst({
            where: {
                id: eventId,
            }
        })

        if(!isValidEvent) {
            throw new AppError('Evento ID não encontrado.', 400);
        }

        const myAttendance = await prisma.myAttendance.create({
            data: {
                eventId: eventId,
            },
        });

        return res.status(200).json(myAttendance);
    }

    async update(req: Request, res: Response) {

        const { id } = req.params;
        const { eventId }: MyAttendance = req.body;
    
        const isExists = await prisma.myAttendance.findUnique({
          where: {
            id: id,
          }
        });
    
        if (!isExists) throw new AppError(`MyAttendanceId: ${id} - não encontrado(a).`);

        const isValidEvent = await prisma.event.findFirst({
            where: {
                id: eventId,
            }
        });

        if(!isValidEvent) {
            throw new AppError('Evento ID não encontrado.', 400);
        }
    
        const myAttendance = await prisma.myAttendance.update({
          data: {
            eventId: eventId
          },
          where: {
            id: id,
          },
        });
    
        return res.status(200).json(myAttendance);
      
      }

}

export default MyAttendanceController;