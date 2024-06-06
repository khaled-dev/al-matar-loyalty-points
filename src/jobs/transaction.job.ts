import Transaction, {TransactionModel, TransactionStatus} from "../models/transaction.model";
import User, {UserModel} from "../models/user.model";
import {scheduleJob} from "node-schedule/lib/schedule";
import Logging from "../config/logging";


const rejectTransactions = async () => {
    scheduleJob('59 * * * * *', async () => {
        Logging.info('...................')
        Logging.info('..CronJob Running..')
        Logging.info('...................')

        const tenMinutesAgo : Date  = new Date(Date.now() - ( Number(process.env.TRANSACTION_EXPIRE_TIME) * 60 * 1000))
        
        // get all [old&pending] transactions
        const transactions : TransactionModel[]   = await Transaction.find({
            status: TransactionStatus.PENDING,
            createdAt: {$lt: tenMinutesAgo}
        })

        // if nothing found
        if (transactions.length === 0) {
            Logging.info('CronJob: no transactions found...')
            return;
        }

        // reject old transactions
        const transactionIds : string[] = transactions.map((transaction: TransactionModel) => {return transaction.id })
        await Transaction.updateMany({
            _id: {$in: transactionIds},
        }, {
            status: TransactionStatus.REJECTED,
        })
        Logging.info('CronJob: transactions updated successfully ids: ' + transactionIds)

        // resend points to its original sender
        transactions.map( async (transaction : TransactionModel) => {
            let user : UserModel = await User.findOne({email: transaction.senderEmail})
            user.points += transaction.points
            await user.save()

            Logging.info('CronJob: user id: ' + user.id + ' updated successfully.')
        })


        Logging.info('...................')
        Logging.info('...CronJob: Done...')
        Logging.info('...................')

    })
}

export default {rejectTransactions}
