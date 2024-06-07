import dotenv from 'dotenv';

dotenv.config();


// Database configurations
const MONGO_USERNAME = process.env.MONGO_USERNAME || ''
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ''
const MONGO_DB       = process.env.MONGO_DB || ''
const MONGO_PORT   = process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : 27017
const MONGO_HOST     = process.env.MONGO_HOST || ''
const MONGO_URL      = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`

// Server configurations
const SERVER_PORT  = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337

export const config = {
    mongo: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD,
        url: MONGO_URL,
    },
    server: {
        port: SERVER_PORT
    }
};
