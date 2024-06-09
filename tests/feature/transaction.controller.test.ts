import request from 'supertest';
import app from '../../src/server';
import User from "../../src/models/user.model";
import Transaction, {TransactionStatus} from "../../src/models/transaction.model";
import bcrypt from 'bcrypt';
import db from "../../src/config/db";
import authService from "../../src/services/auth.service";

describe('transaction', () => {
    let userToken: string;
    let userId: number;

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

    beforeEach(async () => {
        const user : User = await User.create({
            name: 'transaction Sender',
            email: 'transactionSender@email.com',
            password: await bcrypt.hash('password', 10),
            points: 500,
        })

        userId = user.id
        userToken = authService.signAuth({ id: user.id, email: user.email })
    })

    describe('list', () => {
        it('should list his transactions', async () => {
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            await Transaction.create({
                senderId: userId,
                receiverId: receiver.id,
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
            const receiver : User = await User.create({
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

            // check sender's points has been deducted
            const senderChecker : User = await User.findOne({ where:{email: 'transactionSender@email.com'}})
            expect(senderChecker.points).toEqual(490)

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
            const receiver : User = await User.create({
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
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : Transaction = await Transaction.create({
                senderId: userId,
                receiverId: receiver.id,
                points: 10,
                status: TransactionStatus.PENDING
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

            // check sender's points did not add it back to him
            const senderChecker : User = await User.findOne({ where:{email: 'transactionSender@email.com'}})
            expect(senderChecker.points).toEqual(500)

        })

        it('should not confirm not pending transaction', async () => {
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : Transaction = await Transaction.create({
                senderId: userId,
                status: 'confirmed',
                receiverId: receiver.id,
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
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : Transaction = await Transaction.create({
                senderId: userId + 1,
                receiverId: receiver.id,
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
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : Transaction = await Transaction.create({
                senderId: userId,
                receiverId: receiver.id,
                points: 10,
                status: TransactionStatus.PENDING
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

            // check sender's points has benn added it back to him
            const senderChecker : User = await User.findOne({ where:{email: 'transactionSender@email.com'}})
            expect(senderChecker.points).toEqual(510)
        })

        it('should not reject not pending transaction', async () => {
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : Transaction = await Transaction.create({
                senderId: userId,
                status: 'rejected',
                receiverId: receiver.id,
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
            const receiver : User = await User.create({
                name: 'transaction Receiver',
                email: 'transactionReceiver@email.com',
                password: await bcrypt.hash('password', 10),
            })

            const transaction : Transaction = await Transaction.create({
                senderId: userId + 1,
                receiverId: receiver.id,
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

})


