"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const AppError_1 = __importDefault(require("../../errors/AppError"));
class CampusController {
    async find(req, res) {
        const { matricula, userId } = (0, jwt_decode_1.default)(req.headers['authorization']);
        const campus = await prisma.campus.findMany({
            include: {
                university: true
            }
        });
        return res.status(200).json(campus);
    }
    async create(req, res) {
        const { slogan, cep, logradouro, number, district, city, phone, siteUrl, email, logo, certificateTemplate, primaryColor, secundaryColor, tertiaryColor, universityId, stateId } = req.body;
        const isValidUniversity = await prisma.university.findFirst({
            where: {
                id: universityId,
            }
        });
        if (!isValidUniversity) {
            throw new AppError_1.default('Universidade ID não encontrado.', 400);
        }
        const isValidState = await prisma.state.findFirst({
            where: {
                id: stateId,
            }
        });
        if (!isValidState)
            throw new AppError_1.default('Estado ID não encontrado.', 400);
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
        if (isExists)
            throw new AppError_1.default(`Campus ${isExists.slogan} já cadastrado para ${isExists.university.name}`, 400);
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
exports.default = CampusController;
