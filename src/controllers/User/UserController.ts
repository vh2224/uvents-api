import { Request, Response } from 'express';

import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import jwt_decode from "jwt-decode";

import AppError from '../../errors/AppError';

import { IJWTDecodedProps } from '../../services/verifyJwt';

import { trimBeforeAndAfter } from '../../utils/trimBeforeAfter';

class UserController {

  //Auth 

  async auth(req: Request, res: Response) {
    const { matricula, password } = req.body;

    const getUserPassword = await prisma.user.findFirst({
      where: {
        AND: [
          { matricula: matricula },
          { isActive: true },
        ]
      },
      select: {
        password: true,
      }
    });

    if (!getUserPassword) {
      throw new AppError('Usuário ou senha não encontrados.', 401);
    }

    const match = await bcrypt.compare(password, getUserPassword.password);

    if (match) {
      let user: User = await prisma.user.findFirst({
        where: {
          matricula: matricula
        }
      });

      let userId = user.id;

      
      await prisma.user.update({
        where: {
          matricula: user.matricula,
        },
        select: {
          lastLogin: true,
        },
        data: {
          lastLogin: new Date(),
        }
      });

      delete user.password;

      user.lastLogin = new Date();

      const jwtKey = process.env.JWT_SECRET;
      const jwtExpirySeconds = 60 * 60 * 24 * 7; //7 days

      const token = jwt.sign({ matricula, userId }, jwtKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
      });

      return res.status(200).json({
        user: user,
        token: token,
        expires_in: jwtExpirySeconds,
      });
    }
    else {
      throw new AppError('User not found.', 404)
    }
  };


  // Get all Users

  async getUsers(req: Request, res: Response) {

    const { search } = req.query;

    let users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: String(search),
              mode: 'insensitive',
            }
          },
          {
            matricula: {
              contains : String(search),
              mode: 'insensitive',
            }
          },
          {
            email: {
              contains: String(search),
              mode: 'insensitive',
            }
          },
        ],
      }
    });

    if (users) {
      users.forEach((user) => {
        delete user.password;
      });
    }

    return res.status(200).json(users);
  };


  // Create User

  async create(req: Request, res: Response) {

    const { matricula, password, name, email, role, photoUrl, courseId }: User = req.body;

    const isExists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { matricula: matricula },
        ]
      }
    });

    if (isExists) {
      throw new AppError('Usuário já existe.', 400);
    }

    const user = await prisma.user.create({
      data: {
        matricula: matricula,
        password: bcrypt.hashSync(password, 8),
        name: name,
        email: email,
        role: role,
        photoUrl: photoUrl,
        courseId: courseId,
      }
    });

    return res.status(200).json(user);
  };


  // Update User

  async updateUser(req: Request, res: Response) {
    const { matricula, userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);
    const { name, email, photoUrl, password }: User = req.body;

    let user = await prisma.user.findFirst({
      where: {
        matricula: matricula,
      }
    });

    if (!user) return res.json("User not found.")

    user = await prisma.user.update({
      where: {
        matricula: matricula
      },
      data: {
        matricula: matricula,
        name: trimBeforeAndAfter(name),
        email: email,
        photoUrl: photoUrl,
        lastLogin: user.lastLogin,
      }
    });

    delete user.password;

    return res.status(200).json(user);
  };


  // Update User Avatar

  async updateUserAvatar(req: Request, res: Response) {
    const { matricula, userId }: IJWTDecodedProps = jwt_decode(req.headers['authorization']);
    const { name, email, photoUrl }: User = req.body;

    let user = await prisma.user.findFirst({
      where: {
        id: userId,
      }
    });

    if (!user) return res.json("User not found.");

    const { firebaseUrl: avatarUrl } = req.params;

    user = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        photoUrl: avatarUrl,
      }
    });

    return res.status(200).json(user);
  };


  // Delete User

  async deleteUser(req: Request, res: Response) {
    const { matricula: matriculaParam } = req.body;

    let user = await prisma.user.findUnique({
      where: {
        matricula: matriculaParam,
      }
    });

    if (!user) return res.json("User not found.")

    user = await prisma.user.delete({
      where: {
        matricula: matriculaParam
      },
    });

    delete user.password;

    return res.status(200).json({});
  };
}

export default UserController;