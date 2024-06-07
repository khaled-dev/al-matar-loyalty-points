import request from 'supertest';
import app from '../../src/server';
import User, {UserModel} from "../../src/models/user.model";
import Transaction, {TransactionModel} from "../../src/models/transaction.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

describe('transaction', () => {

    let userToken: string;

    beforeEach(async () => {
        const user : UserModel = await User.create({
            name: 'transaction Sender',
            email: 'transactionSender@email.com',
            password: await bcrypt.hash('password', 10),
        })

        userToken = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_EXPIRE });
    })

    describe('list', () => {
        it('should list his transactions', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            await Transaction.create({
                senderEmail: 'transactionSender@email.com',
                receiverEmail: receiver.email,
                points: 77,
            })

            const res = await request(app)
                .get('/transactions')
                .set('Authorization', 'Bearer ' + userToken)
                .send()

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('Transaction list')
            expect(res.body.data[0].ReceiverEmail).toEqual(receiver.email)
            expect(res.body.data[0].Points).toEqual(77)
        })
    })


    describe('create', () => {
        it('should create a new transaction', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const res = await request(app)
                .post('/transactions')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    receiverEmail: receiver.email,
                    points: 10,
                })

            expect(res.statusCode).toEqual(201)
            expect(res.body.message).toEqual('Points transferred successfully')
            expect(res.body.data).toHaveProperty('ID')
            expect(res.body.data.SenderEmail).toEqual('transactionSender@email.com')
            expect(res.body.data.ReceiverEmail).toEqual(receiver.email)
            expect(res.body.data.Points).toEqual(10)
        })

        it('should not create a transaction to yourself', async () => {
            const res = await request(app)
                .post('/transactions')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    receiverEmail: 'transactionSender@email.com',
                    points: 10,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('The transaction is made to yourself!!')
            expect(res.body.error).toHaveProperty('receiverEmail')
        })

        it('should not create a transaction for invalid receiver', async () => {
            const res = await request(app)
                .post('/transactions')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    receiverEmail: 'invalidReceiver@email.com',
                    points: 10,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
            expect(res.body.error[0].message).toEqual('"receiverEmail" does not exist')
        })

        it('should not create a transaction with more points than mine', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const res = await request(app)
                .post('/transactions')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    receiverEmail: receiver.email,
                    points: 501,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('You dont have enough points.')
            expect(res.body.error).toHaveProperty('points')
        })
    })

    describe('confirm', () => {
        it('should confirm his transaction', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : TransactionModel = await Transaction.create({
                senderEmail: 'transactionSender@email.com',
                receiverEmail: receiver.email,
                points: 10,
            })

            const res = await request(app)
                .put('/transactions/confirm/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: transaction.id,
                })

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('Transaction Confirmed')
            expect(res.body.data).toHaveProperty('ID')
            expect(res.body.data.SenderEmail).toEqual('transactionSender@email.com')
            expect(res.body.data.ReceiverEmail).toEqual(receiver.email)
            expect(res.body.data.Points).toEqual(10)
        })

        it('should not confirm not pending transaction', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : TransactionModel = await Transaction.create({
                senderEmail: 'transactionSender@email.com',
                status: 'confirmed',
                receiverEmail: receiver.email,
                points: 10,
            })

            const res = await request(app)
                .put('/transactions/confirm/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: transaction.id,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('You cant confirm this transaction.')
            expect(res.body.error).toHaveProperty('transactionId')

        })

        it('should not confirm transactions did not made by him', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : TransactionModel = await Transaction.create({
                senderEmail: 'strangerSender@email.com',
                receiverEmail: receiver.email,
                points: 10,
            })

            const res = await request(app)
                .put('/transactions/confirm/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: transaction.id,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('You cant confirm this transaction.')
            expect(res.body.error).toHaveProperty('transactionId')

        })

        it('should not confirm transactions with invalid id', async () => {
            const res = await request(app)
                .put('/transactions/confirm/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: 'invalid-id',
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
        })
    })

    describe('reject', () => {
        it('should reject his transaction', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : TransactionModel = await Transaction.create({
                senderEmail: 'transactionSender@email.com',
                receiverEmail: receiver.email,
                points: 10,
            })

            const res = await request(app)
                .put('/transactions/reject/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: transaction.id,
                })

            expect(res.statusCode).toEqual(200)
            expect(res.body.message).toEqual('Transaction Rejected')
            expect(res.body.data).toHaveProperty('ID')
            expect(res.body.data.SenderEmail).toEqual('transactionSender@email.com')
            expect(res.body.data.ReceiverEmail).toEqual(receiver.email)
            expect(res.body.data.Points).toEqual(10)
        })

        it('should not reject not pending transaction', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : TransactionModel = await Transaction.create({
                senderEmail: 'transactionSender@email.com',
                status: 'rejected',
                receiverEmail: receiver.email,
                points: 10,
            })

            const res = await request(app)
                .put('/transactions/reject/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: transaction.id,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('You cant reject this transaction.')
            expect(res.body.error).toHaveProperty('transactionId')

        })

        it('should not reject transactions did not made by him', async () => {
            const receiver : UserModel = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : TransactionModel = await Transaction.create({
                senderEmail: 'strangerSender@email.com',
                receiverEmail: receiver.email,
                points: 10,
            })

            const res = await request(app)
                .put('/transactions/reject/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: transaction.id,
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('You cant reject this transaction.')
            expect(res.body.error).toHaveProperty('transactionId')

        })

        it('should not reject transactions with invalid id', async () => {
            const res = await request(app)
                .put('/transactions/reject/')
                .set('Authorization', 'Bearer ' + userToken)
                .send({
                    transactionId: 'invalid-id',
                })

            expect(res.statusCode).toEqual(422)
            expect(res.body.message).toEqual('Bad Request')
        })
    })


    afterEach(async () => {
        await User.deleteMany()
        await Transaction.deleteMany()
    })

    afterAll( () => {
        mongoose.disconnect()
    })

})


