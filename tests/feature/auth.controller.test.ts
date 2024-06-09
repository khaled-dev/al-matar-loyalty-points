import request from 'supertest';
import app from '../../src/server';
import User from "../../src/models/user.model";
import bcrypt from 'bcrypt';
import db from '../../src/config/db'


describe('Authentication', () => {

    beforeAll(async () => {
        await db.sync({ force: true });
    });

    afterEach(async () => {
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await db.close();
    });

    describe('register', () => {

        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                })

            expect(res.statusCode).toEqual(201)
            expect(res.body.message).toEqual('Registration successful')
            expect(res.body.data).toHaveProperty('access-token')
        })

        it('should not register a user without name input', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
            expect(res.body.error[0].message).toEqual('"name" is required')
        })

        it('should not register a user without email input', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    password: 'password123',
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
            expect(res.body.error[0].message).toEqual('"email" is required')
        })

        it('should not register user with the same email twice', async () => {
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            })

            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
            expect(res.body).toHaveProperty('error')

        })
    })

    describe('login', () => {
        it('should login an existing user', async () => {
            const password = 'password1232'
            const user : User = await User.create({
                name: 'Test User2',
                email: 'test2@example.com',
                password: await bcrypt.hash(password, 10),
            })

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: user.email,
                    password: password,
                })

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('Logged in successful')
            expect(res.body.data).toHaveProperty('access-token')
        })

        it('should not login a user with wrong credentials', async () => {
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            })

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrong password',
                })

            expect(res.statusCode).toEqual(401)
            expect(res.body.message).toEqual('Invalid Credentials')
            expect(res.body).toHaveProperty('error')
        })

        it('should not login a user without email input', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    password: 'password123',
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
            expect(res.body.error[0].message).toEqual('"email" is required')
        });

        it('should not login not existing user', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })

            expect(res.statusCode).toEqual(401)
            expect(res.body.message).toEqual('Invalid Credentials')
            expect(res.body).toHaveProperty('error')
        })
    })

})
