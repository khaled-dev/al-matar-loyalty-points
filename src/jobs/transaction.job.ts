import Transaction, {TransactionStatus} from "../models/transaction.model"
import User from "../models/user.model"
import {scheduleJob} from "node-schedule/lib/schedule"
import Logging from "../config/logging"
import db from "../config/db"
import { Op } from 'sequelize'


const rejectTransactions = async () => {
    scheduleJob('59 * * * * *', async () => {
        Logging.info('...................')
        Logging.info('..CronJob Running..')
        Logging.info('...................')

        await doRejectTransactions()

        Logging.info('...................')
        Logging.info('...CronJob: Done...')
        Logging.info('...................')

    })
}

const doRejectTransactions = async () : Promise<void> => {
    const expireTime : number = process.env.TRANSACTION_EXPIRE_TIME ? Number(process.env.TRANSACTION_EXPIRE_TIME) : 10
    console.log(new Date(Date.now() - ( expireTime * 60 * 100)))
    const tenMinutesAgo : Date  = new Date(Date.now() - ( expireTime * 60 * 100))

    await db.transaction(async t => {

        // get all [old&pending] transactions
        const transactions : Transaction[]   = await Transaction.findAll({
            where:{
                status: TransactionStatus.PENDING,
                createdAt: {
                    [Op.gt]: tenMinutesAgo
                }
            },
            include: [{ all: true }],
            transaction: t
        })

        // if nothing found
        if (transactions.length === 0) {
            if (process.env.NODE_ENV !== 'test') Logging.info('CronJob: no transactions found...')
            return
        }

        // reject old transactions
        const transactionIds : number[] = transactions.map((transaction: Transaction) => { return transaction.id })
        await Transaction.update({
            status: TransactionStatus.REJECTED
        }, {
            where: {id: {[Op.in]: transactionIds}},
            transaction: t
        })
        if (process.env.NODE_ENV !== 'test') Logging.info('CronJob: transactions updated successfully ids: ' + transactionIds)

        // resend points to its original sender
        for (let transaction  of transactions) {
            let sender : User = await User.findOne({ where: {id: transaction.sender.id }, transaction: t})
            sender.points += transaction.points

            await Transaction.update({
                status: TransactionStatus.REJECTED
            }, {
                where: {id: sender.id},
                transaction: t
            })

            if (process.env.NODE_ENV !== 'test') Logging.info('CronJob: user id: ' + sender.id + ' updated successfully.')
        }

    })

}

export default {rejectTransactions, doRejectTransactions}