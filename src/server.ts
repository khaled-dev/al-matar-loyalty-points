import express from 'express';
import { config } from './config/config';
import Logging from './config/logging';
import authRoutes from './routes/auth.route';
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger.json";
import { Sequelize } from 'sequelize-typescript';

const app = express()

if (process.env.NODE_ENV !== 'test') {
    const sequelize = new Sequelize({
        database: 'postgres',
        host: '172.17.0.2',
        port: Number(5432),
        username: 'postgres',
        password: 'test',
        dialect: 'postgres',
        models: [__dirname + '/models'],
    });

    sequelize.authenticate()
        .then(() => console.log('Database connected'))
        .catch((err) => console.error('Unable to connect to the database:', err));
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

app.use('/auth', authRoutes)

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
