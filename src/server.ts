import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './config/logging';
import transactionRoutes from './routes/transaction.route';
import authRoutes from './routes/auth.route';
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger.json";

const router = express();

mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.');
        StartServer();
        // rejectTransactions.rejectTransactions()
    })
    .catch((error) => Logging.error(error));


const StartServer = () => {
    router.use((req, res, next) => {
        Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on('finish', () => {
            Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    router.use('/transactions', transactionRoutes);
    router.use('/auth', authRoutes);
    router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    router.use((req, res, next) => {
        const error = new Error('Not found');
        Logging.error(error);

        res.status(404).json({
            message: error.message
        });
    });

    http.createServer(router)
        .listen(
            config.server.port,
            () => Logging.info(`Server is running on port ${config.server.port}`)
        );
};
