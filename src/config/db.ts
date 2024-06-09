import {Sequelize} from "sequelize-typescript"
import {Dialect} from "sequelize"
import { development, testing } from './database.json'
// const db = new Sequelize({
//         dialect: 'sqlite',
//         storage: ':memory:',
//     });
let db : Sequelize
// console.log(process.env.NODE_ENV)


if (process.env.NODE_ENV !== 'test') {
    db = new Sequelize({
        database: development.database,
        host: development.host,
        port: Number(development.port),
        username: development.username,
        password: development.password,
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
