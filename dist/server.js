"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const routes_1 = require("./routes");
const celebrate_1 = require("celebrate");
const cors_1 = __importDefault(require("cors"));
const AppError_1 = __importDefault(require("./errors/AppError"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use(routes_1.router);
app.use((0, celebrate_1.errors)());
app.use((error, req, res, _) => {
    if (error instanceof AppError_1.default) {
        return res.status(error.statusCode).json({
            status: 'Error',
            error: error.message,
        });
    }
    console.log(error);
    return res.status(500).json({
        status: "error",
        message: "Internal server error."
    });
});
app.listen('3000', () => console.log('server is running! 🎉'));
