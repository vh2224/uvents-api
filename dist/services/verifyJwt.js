"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
async function verifyJWT(req, res, next) {
    const token = req.headers['authorization'];
    const tokenSplited = token.split(" ")[1];
    if (!token)
        return res.status(401).json({ auth: false, message: 'No token provided.' });
    jsonwebtoken_1.default.verify(tokenSplited, JWT_SECRET, function (err, decoded) {
        if (err)
            return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
        next();
    });
}
exports.default = verifyJWT;
