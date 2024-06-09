
import User, {UserModel} from "../../src/models/user.model";
import mongoose from "mongoose";
import Transaction, {TransactionModel, TransactionStatus} from "../../oldmodels/transaction.model";
import { MongoMemoryServer } from 'mongodb-memory-server';
import TransactionJob from '../../src/jobs/transaction.job'


describe('cronJob', () => {

    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = await mongoServer.getUri();
        await mongoose.connect(uri);
    });

    describe('transaction', () => {
        it('should reject pending outdated transactions', async () => {

            // create sender user
            const sender : UserModel = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender@email.com',
                points: 90,
                password: 'password',
            })

            const rejectable : TransactionModel = new Transaction({
                senderEmail: sender.email,
                receiverEmail: 'transactionReciver@email.com',
                points: 10,
            })

            rejectable.createdAt = new Date(new Date().getTime() - 11 * 60 * 1000) //
            await rejectable.save()


            await TransactionJob.doRejectTransactions()

            const rejected : TransactionModel = await Transaction.findOne({senderEmail: sender.email})
            const senderChecker : UserModel = await User.findOne({email: sender.email})

            expect(rejected.status).toEqual(TransactionStatus.REJECTED)
            expect(senderChecker.points).toEqual(100)
        })

        it('should not reject confirmed transactions', async () => {

            const sender : UserModel = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender@email.com',
                points: 90,
                password: 'password',
            })

            await Transaction.create({
                senderEmail: sender.email,
                receiverEmail: 'transactionReciver@email.com',
                points: 10,
                status: 'confirmed'
            })

            await TransactionJob.doRejectTransactions()

            const transaction : TransactionModel = await Transaction.findOne({senderEmail: sender.email})
            const senderChecker : UserModel = await User.findOne({email: sender.email})

            expect(transaction.status).toEqual(TransactionStatus.CONFIRMED)
            expect(senderChecker.points).toEqual(90)
        })

        it('should not reject newly added transactions', async () => {

            // create sender user
            const sender : UserModel = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender@email.com',
                points: 90,
                password: 'password',
            })

            await Transaction.create({
                senderEmail: sender.email,
                receiverEmail: 'transactionReciver@email.com',
                points: 10,
            })

            await TransactionJob.doRejectTransactions()

            const transaction : TransactionModel = await Transaction.findOne({senderEmail: sender.email})
            const senderChecker : UserModel = await User.findOne({email: sender.email})

            expect(transaction.status).toEqual(TransactionStatus.PENDING)
            expect(senderChecker.points).toEqual(90)
        })
    })


    afterEach(async () => {
        await User.deleteMany()
        await Transaction.deleteMany()
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
})



