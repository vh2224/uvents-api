import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { router } from './routes';
import { errors } from 'celebrate';
import cors from 'cors';


import AppError from './errors/AppError';
import process from 'process';
const port = process.env.PORT || 5005;
console.log(port);

const app = express();

app.use(cors({
    origin: "*",
    methods: "GET,PUT,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }
))

app.use(express.json());
app.use(express.urlencoded());

app.use(router);

app.use(errors());
app.use((error: Error, req: Request, res: Response, _: NextFunction) => {

  if (error instanceof AppError) {
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

app.listen(port, () => console.log(`server is running! 🎉 ${port}`));