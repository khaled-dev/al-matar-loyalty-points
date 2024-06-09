import {Sequelize} from "sequelize-typescript";

const db: Sequelize = new Sequelize({
    database: 'postgres',
    host: '172.17.0.2',
    port: Number(5432),
    username: 'postgres',
    password: 'test',
    dialect: 'postgres',
    models: [__dirname + '/../models'],
})

export default db