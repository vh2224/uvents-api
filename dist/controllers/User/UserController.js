"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const date_fns_1 = require("date-fns");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const trimBeforeAfter_1 = require("../../utils/trimBeforeAfter");
const calcDistance_1 = require("../../utils/calcDistance");
class UserController {
    //Auth 
    async auth(req, res) {
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
            throw new AppError_1.default('Usuário ou senha não encontrados.', 401);
        }
        const match = await bcrypt_1.default.compare(password, getUserPassword.password);
        if (match) {
            let user = await prisma.user.findFirst({
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
            const token = jsonwebtoken_1.default.sign({ matricula, userId }, jwtKey, {
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
            throw new AppError_1.default('User not found.', 404);
        }
    }
    ;
    // Get all Users
    async getUsers(req, res) {
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
                            contains: String(search),
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
    }
    ;
    // Create User
    async create(req, res) {
        const { matricula, password, name, email, role, photoUrl, courseId } = req.body;
        const isExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { matricula: matricula },
                ]
            }
        });
        if (isExists) {
            throw new AppError_1.default('Usuário já existe.', 400);
        }
        const user = await prisma.user.create({
            data: {
                matricula: matricula,
                password: bcrypt_1.default.hashSync(password, 8),
                name: name,
                email: email,
                role: role,
                photoUrl: photoUrl,
                courseId: courseId,
            }
        });
        return res.status(200).json(user);
    }
    ;
    // Update User
    async updateUser(req, res) {
        const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const { name, email, photoUrl, password } = req.body;
        let user = await prisma.user.findFirst({
            where: {
                matricula: matricula,
            }
        });
        if (!user)
            return res.json("User not found.");
        user = await prisma.user.update({
            where: {
                matricula: matricula
            },
            data: {
                matricula: matricula,
                name: (0, trimBeforeAfter_1.trimBeforeAndAfter)(name),
                email: email,
                photoUrl: photoUrl,
                lastLogin: user.lastLogin,
            }
        });
        delete user.password;
        return res.status(200).json(user);
    }
    ;
    // Update User Avatar
    async updateUserAvatar(req, res) {
        const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const { name, email, photoUrl } = req.body;
        let user = await prisma.user.findFirst({
            where: {
                id: userId,
            }
        });
        if (!user)
            return res.json("User not found.");
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
    }
    ;
    // Delete User
    async deleteUser(req, res) {
        const { matricula: matriculaParam } = req.body;
        let user = await prisma.user.findUnique({
            where: {
                matricula: matriculaParam,
            }
        });
        if (!user)
            return res.json("User not found.");
        user = await prisma.user.delete({
            where: {
                matricula: matriculaParam
            },
        });
        delete user.password;
        return res.status(200).json({});
    }
    ;
    async myEvents(req, res) {
        const { userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const myEvents = await prisma.usersEvents.findMany({
            where: {
                userId: userId,
            },
            include: {
                event: {
                    include: {
                        eventsCategories: {
                            select: {
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    }
                                },
                            },
                        }
                    }
                }
            }
        });
        return res.status(200).json(myEvents);
    }
    async registerEvents(req, res) {
        const { userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const { eventId } = req.params;
        const { latitude: userLatitude, longitude: userLongitude } = req.query;
        console.log(userLatitude, userLongitude);
        const isExists = await prisma.usersEvents.findFirst({
            where: {
                AND: {
                    eventId: eventId,
                    userId: userId,
                }
            }
        });
        if (isExists)
            throw new AppError_1.default(`presence-has-already-been-confirmed`);
        const event = await prisma.event.findUnique({
            where: {
                id: eventId,
            },
            select: {
                id: true,
                latitude: true,
                longitude: true,
                startDate: true,
                endDate: true,
            }
        });
        const MAX_TOLERANCE_DISTANCE_IN_KM = 15; //15 KM
        if (!(0, date_fns_1.isPast)(event.startDate)) {
            throw new AppError_1.default('event-not-started');
        }
        if ((0, date_fns_1.isPast)((0, date_fns_1.addHours)(event.endDate, 6))) {
            throw new AppError_1.default('finished-event');
        }
        if ((0, calcDistance_1.calcDistance)(Number(event.latitude), Number(event.longitude), Number(userLatitude), Number(userLongitude)) > MAX_TOLERANCE_DISTANCE_IN_KM) {
            throw new AppError_1.default('not-presence-in-location');
        }
        if (event.id) {
            const userEvent = await prisma.usersEvents.create({
                data: {
                    eventId: eventId,
                    userId: userId,
                },
                include: {
                    event: {
                        include: {
                            eventsCategories: true,
                        }
                    }
                }
            });
            return res.json(userEvent);
        }
        else {
            throw new AppError_1.default('Evento não encontado.', 404);
        }
    }
}
exports.default = UserController;
