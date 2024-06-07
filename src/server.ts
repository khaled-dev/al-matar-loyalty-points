import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './config/logging';
import transactionRoutes from './routes/transaction.route';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger.json";
import rejectTransactions from "./jobs/transaction.job";

const app = express()

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority' })
        .then(async () => {
            Logging.info('Mongo connected successfully.')
                // Run the worker
            if ( process.env.CRONJOB === 'active' ) {
                await rejectTransactions.rejectTransactions()
            }
        })
        .catch((error) => Logging.error(error))
}


if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)
        res.on('finish', () => {
            Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`)
        })

        next()
    })
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/transactions', transactionRoutes)
app.use('/auth', authRoutes)
app.use('/user', userRoutes)

if (process.env.NODE_ENV === 'development') {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}

if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        const error = new Error('Not found');
        Logging.error(error)

        res.status(404).json({
            message: error.message
        })
    })
}

if (process.env.NODE_ENV !== 'test') {
    app.listen(
        config.server.port,
        () => {
            Logging.info(`Server is running on port ${config.server.port}`)
        }
    )
}

// Export for testing
export default app
