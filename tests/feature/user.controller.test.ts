import request from 'supertest';
import app from '../../src/server';
import User, {UserModel} from "../../src/models/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

describe('user', () => {

    describe('points', () => {
        it('should get his points number', async () => {
            const user : UserModel = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender@email.com',
                password: await bcrypt.hash('password', 10),
            })
            let userToken = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_EXPIRE });

            const res = await request(app)
                .get('/user/points')
                .set('Authorization', 'Bearer ' + userToken)
                .send()

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('User Points')
            expect(res.body.data.Points).toEqual(500)
        })
    })

    afterEach(async () => {
        await User.deleteMany()
    })

    afterAll( () => {
        mongoose.disconnect()
    })

})


