import User from "../../src/models/user.model";
import Transaction, {TransactionStatus} from "../../src/models/transaction.model";
import TransactionJob from '../../src/jobs/transaction.job'
import db from "../../src/config/db";
import TransactionModel from "../../src/models/transaction.model";


describe('cronJob', () => {

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

    describe('transaction', () => {
        it('should reject pending outdated transactions', async () => {

            // create sender user
            const sender : User = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender@email.com',
                points: 90,
                password: 'password',
            })

            // create receiver user
            const receiver : User = await User.create({
                name: 'transaction receiver',
                email: 'transactionReceiver@email.com',
                points: 90,
                password: 'password',
            })

            const rejectable : Transaction = await Transaction.create({
                senderId: sender.id,
                receiverId: receiver.id,
                points: 10,
                status: 'pending',
                createdAt: new Date(new Date().getTime() - 11 * 60 * 1000)
            })

            await TransactionJob.doRejectTransactions()

            const rejected : Transaction = await Transaction.findOne({where:{id: rejectable.id}})
            const senderChecker : User = await User.findOne({where:{email: sender.email}})

            expect(rejected.status).toEqual(TransactionStatus.REJECTED)
            expect(senderChecker.points).toEqual(100)
        })

        it('should not reject confirmed transactions', async () => {

            const sender : User = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender2@email.com',
                points: 90,
                password: 'password',
            })

            // create receiver user
            const receiver : User = await User.create({
                name: 'transaction receiver',
                email: 'transactionReceiver2@email.com',
                points: 90,
                password: 'password',
            })

            const confirmed : TransactionModel = await Transaction.create({
                senderId: receiver.id,
                receiverId: receiver.id,
                points: 10,
                status: 'confirmed'
            })

            await TransactionJob.doRejectTransactions()

            const transaction : Transaction = await Transaction.findOne({where:{id: confirmed.id}})
            const senderChecker : User = await User.findOne({where:{email: sender.email}})

            expect(transaction.status).toEqual(TransactionStatus.CONFIRMED)
            expect(senderChecker.points).toEqual(90)
        })

        it('should not reject newly added transactions', async () => {

            // create sender user
            const sender : User = await User.create({
                name: 'transaction Sender',
                email: 'transactionSender3@email.com',
                points: 90,
                password: 'password',
            })

            // create receiver user
            const receiver : User = await User.create({
                name: 'transaction receiver',
                email: 'transactionReceiver3@email.com',
                points: 90,
                password: 'password',
            })

            const newAdded : Transaction= await Transaction.create({
                senderId: sender.id,
                receiverId: receiver.id,
                points: 10,
                status: 'pending'
            })

            await TransactionJob.doRejectTransactions()

            const transaction : Transaction = await Transaction.findOne({where:{id: newAdded.id}})
            const senderChecker : User = await User.findOne({where:{email: sender.email}})

            expect(transaction.status).toEqual(TransactionStatus.PENDING)
            expect(senderChecker.points).toEqual(90)
        })
    })

})



