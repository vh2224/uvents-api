import { Request, Response, NextFunction } from 'express';

import jwt_decode from "jwt-decode";

import { PrismaClient, ERole } from "@prisma/client";
import AppError from '../errors/AppError';

const prisma = new PrismaClient();


export interface IJWTDecodedProps {
  matricula: string;
  userId: string;
}

function authService(roles: ERole[]) { 

  return async (req: Request, res: Response, next: NextFunction) => {

    const { matricula, userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);
  
    const getUserRole = await prisma.user.findFirst({
      where: {
        AND: [
          { id: userId },
          { isActive: true },
        ]
      },
      select: {
        role: true,
      }
    });

    const isAuthorized = roles.indexOf(getUserRole.role) > -1 ? true : false;

    if (isAuthorized) {
      next();
    } 
    else {
      throw new AppError(`Desculpe, você não tem permissão para executar esta ação.`, 401);
    }
  }

}

export default authService;