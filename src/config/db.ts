import {Sequelize} from "sequelize-typescript"
import {Dialect} from "sequelize"
import { development, testing } from './database.json'

let db : Sequelize

if (process.env.NODE_ENV !== 'test') {
    db = new Sequelize({
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialect: development.dialect as Dialect,
        timezone: '+00:00',
        models: [__dirname + '/../models'],
    })
} else {
    db = new Sequelize({
        dialect: testing.dialect as Dialect,
        storage: testing.storage,
        models: [__dirname + '/../models'],
    });
}

export default db
