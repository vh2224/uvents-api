"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../errors/AppError"));
const prisma = new client_1.PrismaClient();
function authService(roles) {
    return async (req, res, next) => {
        const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
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
            throw new AppError_1.default(`Desculpe, você não tem permissão para executar esta ação.`, 401);
        }
    };
}
exports.default = authService;
