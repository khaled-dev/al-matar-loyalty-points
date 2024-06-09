import express from 'express'
import { config } from './config/config'
import transactionRoutes from './routes/transaction.route'
import Logging from './config/logging'
import authRoutes from './routes/auth.route'
import userRoutes from './routes/user.route'
import swaggerUi from "swagger-ui-express"
import * as swaggerDocument from "../swagger.json"
import db from './config/db'
import rejectTransactions from "./jobs/transaction.job"
import User from "./models/user.model";

const app = express()



// Adjust 0 before single-digit date
// const date = ('0' + dateObject.getDate()).slice(-2);
//
// // Adjust 0 before single-digit month and add 1 because getMonth() is 0-indexed
// const month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
//
// // Get current year
// const year = dateObject.getFullYear();
//
// // Get current hours, minutes, and seconds
// const hours = dateObject.getHours();
// const minutes = dateObject.getMinutes();
// const seconds = dateObject.getSeconds();

// 10 min back
let date = new Date(Date.now() - ( 10 * 60 * 1000))
let dateObject = new Date().toUTCString();

// Print date and time in YYYY-MM-DD hh:mm:ss format
console.log(date);
console.log(dateObject);
console.log(process.env.TZ);
console.log()

if (process.env.NODE_ENV !== 'test') {
    db.authenticate()
        .then(() => console.log('Database connected'))
        .catch((err) => console.error('Unable to connect to the database:', err))

    if ( process.env.CRONJOB === 'active' ) {
        rejectTransactions.rejectTransactions()
    }
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

try {
    app.use('/auth', authRoutes)
    app.use('/transactions', transactionRoutes)
    app.use('/user', userRoutes)
} catch (e) {Logging.error(e)}

if (process.env.NODE_ENV === 'development') {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}

if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        const error = new Error('Not found')
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
