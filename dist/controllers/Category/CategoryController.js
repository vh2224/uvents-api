"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const AppError_1 = __importDefault(require("../../errors/AppError"));
class CategoryController {
    async find(req, res) {
        const categories = await prisma.category.findMany();
        return res.status(200).json(categories);
    }
    async create(req, res) {
        const { name, slug } = req.body;
        const isExists = await prisma.category.findFirst({
            where: {
                name: name,
            }
        });
        if (isExists)
            throw new AppError_1.default(`${isExists.name} já cadastrado(a).`);
        const category = await prisma.category.create({
            data: {
                name: name,
                slug: slug,
            },
        });
        return res.json(category);
    }
    async update(req, res) {
        const { id } = req.params;
        const { name, slug } = req.body;
        const isExists = await prisma.category.findUnique({
            where: {
                id: id,
            }
        });
        if (!isExists)
            throw new AppError_1.default(`categoryId: ${id} - não encontrado(a).`);
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
exports.default = CategoryController;
