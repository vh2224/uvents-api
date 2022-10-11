"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const AppError_1 = __importDefault(require("../../errors/AppError"));
class UniversityCotroller {
    async find(req, res) {
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
    async create(req, res) {
        const { name } = req.body;
        const isExists = await prisma.university.findFirst({
            where: {
                name: name,
            }
        });
        if (isExists)
            throw new AppError_1.default(`${isExists.name} já cadastrado(a).`);
        const university = await prisma.university.create({
            data: {
                name: name,
            },
        });
        return res.json(university);
    }
    async update(req, res) {
        const { id } = req.params;
        const { name } = req.body;
        const isExists = await prisma.university.findUnique({
            where: {
                id: id,
            }
        });
        if (!isExists)
            throw new AppError_1.default(`universityId: ${id} - não encontrado(a).`);
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
exports.default = UniversityCotroller;
