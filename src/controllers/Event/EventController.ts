import { Request, Response } from 'express';

import { PrismaClient, Event } from "@prisma/client";

const prisma = new PrismaClient();

import AppError from '../../errors/AppError';

class EventController {

    async find(req: Request, res: Response) {
        const event = await prisma.event.findMany({
            include: {
                user: true,
                eventsCategories: {
                    include: {
                        category: true,
                    }
                }
            }
        });

        return res.status(200).json(event);
    }

    async create(req: Request, res: Response) {
        const { name, qrCodeUrl, startDate, endDate, images, description, price, amoutHours, modality, meetingUrl, userId, cep, logradouro, address, number, complement, district, city, state, country, longitude, latitude }: Event = req.body;

        const isValidUser = await prisma.user.findFirst({
            where: {
                id: userId,
            }
        })

        if(!isValidUser) {
            throw new AppError('Usuario ID não encontrado.', 400);
        }

        const event = await prisma.event.create({
            data: {
                name: name,
                qrCodeUrl: qrCodeUrl,
                startDate: startDate,
                endDate: endDate,
                images: images,
                description: description,
                price: price,
                amoutHours: amoutHours,
                modality: modality,
                meetingUrl: meetingUrl,
                userId: userId,
                cep: cep, 
                logradouro: logradouro,
                address: address,
                number: number,
                complement: complement, 
                district: district, 
                city: city, 
                state: state, 
                country: country, 
                longitude: longitude, 
                latitude: latitude,
            },
        })

        return res.status(200).json(event);
    }
    
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { name, qrCodeUrl, startDate, endDate, images, description, price, amoutHours, modality, meetingUrl, userId, cep, logradouro, address, number, complement, district, city, state, country, longitude, latitude  }: Event = req.body;

        const isExists = await prisma.event.findUnique({
            where: {
              id: id,
            }
          });
      
          if (!isExists) throw new AppError(`EventId: ${id} - não encontrado(a).`);

        const isValidUser = await prisma.user.findFirst({
            where: {
                id: userId,
            }
        });

        if(!isValidUser) {
            throw new AppError('Usuario ID não encontrado.', 400);
        }

        const event = await prisma.event.update({
            data: {
                name: name,
                qrCodeUrl: qrCodeUrl,
                startDate: startDate,
                endDate: endDate,
                images: images,
                description: description,
                price: price,
                amoutHours: amoutHours,
                modality: modality,
                meetingUrl: meetingUrl,
                userId: userId,
                cep: cep, 
                logradouro: logradouro,
                address: address,
                number: number,
                complement: complement, 
                district: district, 
                city: city, 
                state: state, 
                country: country, 
                longitude: longitude, 
                latitude: latitude,
            },
            where: {
                id: id,
            },
        });

        return res.status(200).json(event);
    }
}

export default EventController;