import dotenv from 'dotenv';

dotenv.config();



// Server configurations
const SERVER_PORT  = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337

export const config = {
    server: {
        port: SERVER_PORT
    }
};
