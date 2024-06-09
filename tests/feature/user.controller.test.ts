import request from 'supertest';
import app from '../../src/server';
import User  from "../../src/models/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from "../../src/config/db";
import Transaction from "../../src/models/transaction.model";
import authService from "../../src/services/auth.service";

describe('user', () => {

    beforeAll(async () => {
        await db.sync({ force: true });
    });

    afterEach(async () => {
        await User.destroy({ where: {} });
        await Transaction.destroy({ where: {} });
    });

    afterAll(async () => {
        await db.close();
    });

    describe('points', () => {
        it('should get his points number', async () => {
            const user : User = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender@email.com',
                password: await bcrypt.hash('password', 10),
                points: 500,
            })

            const userToken = authService.signAuth({ id: user.id, email: user.email })

            const res = await request(app)
                .get('/user/points')
                .set('Authorization', 'Bearer ' + userToken)
                .send()

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('User Points')
            expect(res.body.data.Points).toEqual(500)
        })
    })
})


