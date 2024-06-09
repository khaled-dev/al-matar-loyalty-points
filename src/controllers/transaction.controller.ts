import {Request, Response} from 'express'
import Transaction, {TransactionStatus} from '../models/transaction.model'
import response from "../http/response"
import authService from "../services/auth.service"
import transactionView from "../views/transaction.view"
import User from "../models/user.model"
import transactionFactory from "../models/factory/transaction.factory"
import { Op } from 'sequelize'
import db from "../config/db"

interface ICreateTransactionRequest extends Request {
    body: {
        receiverEmail: string
        points: number
    }
}

interface IConfirmTransactionRequest extends Request {
    body: {
        transactionId: string
    }
}

/**
 * List user's transactions.
 *
 * @param req
 * @param res
 */
const listTransactions = async (req: Request, res: Response) => {
    const authId : string = authService.getAuthId(req)

    const transactions : Transaction[] = await Transaction.findAll({ where: {senderId: authId} , include: [{ all: true }]})

    response.success(res, transactionView.many(transactions), 'Transaction list')
}

/**
 * Create transaction by the logged-in user.
 *
 * @param req
 * @param res
 */
const createTransaction = async (req: ICreateTransactionRequest, res: Response) => {
    const { receiverEmail, points } = req.body
    const authEmail : string = authService.getAuthEmail(req)

    if (receiverEmail === authEmail) return response.validation(res, {receiverEmail}, 'The transaction is made to yourself!!', 422)

    await db.transaction(async t => {
        // Use "pessimistic" lock
        // "Select for update" will add a 'pessimistic lock' on the selected row.
        // It is To prevent any other attempt to select it until the transaction is commited or rolled back
        const sender: User = await User.findOne({
            where: {email: authEmail},
            lock: t.LOCK.UPDATE,
            transaction: t
        })

        if (sender.points < points) return response.validation(res, {points}, 'You dont have enough points.', 422)

        const receiver: User = await User.findOne({where: {email: receiverEmail}, transaction: t})

        const transaction: Transaction = await transactionFactory.create({
            senderId: sender.id,
            receiverId: receiver.id,
            points: points,
        }, sender, t)

        return response.success(res, transactionView.one(transaction), 'Points transferred successfully', 201)
    })
}

/**
 * Logged-in user can confirm the transactions made by himself.
 *
 * @param req
 * @param res
 */
const confirmTransaction = async (req: IConfirmTransactionRequest, res: Response) => {
    const authId : string = authService.getAuthId(req)
    console.log(new Date(Date.now()))
    const tenMinutesAgo = new Date(new Date().getTime() - Number(process.env.TRANSACTION_EXPIRE_TIME) * 60 * 1000);
    let transaction : Transaction  = await Transaction.findOne({ where: {
            id: req.body.transactionId,
            status:  TransactionStatus.PENDING,
            senderId: authId,
            createdAt: {
                [Op.gt]: tenMinutesAgo
            }
        }, include: [{ all: true }]
    })

    if (! transaction) return response.validation(res, {transactionId: req.body.transactionId}, 'You cant confirm this transaction.', 422)

    await db.transaction(async t => {

        // set as confirmed
        await Transaction.update({ status : TransactionStatus.CONFIRMED }, {
            where: { id: req.body.transactionId },
            transaction: t
        })

        // send the points to the receiver
        const receiver : User = await User.findOne({ where: {id: transaction.receiver.id}, transaction: t})
        const pointsSum : number = receiver.points + transaction.points

        await User.update({ points: pointsSum }, {
            where: {id: receiver.id},
            transaction: t
        })

        transaction = await Transaction.findOne({ where: {id: transaction.id}, transaction: t, include: [{ all: true }]})
    })

    response.success(res, transactionView.one(transaction), 'Transaction Confirmed')
}

/**
 * Logged-in user can reject the transactions made by himself.
 *
 * @param req
 * @param res
 */
const rejectTransaction = async (req: IConfirmTransactionRequest, res: Response) => {
    const authId : string = authService.getAuthId(req)
    let transaction : Transaction  = await Transaction.findOne({ where: {
            id: req.body.transactionId,
            status:  TransactionStatus.PENDING,
            senderId: authId,
        } , include: [{ all: true }]
    })

    if (! transaction) return response.validation(res, {transactionId: req.body.transactionId}, 'You cant reject this transaction.', 422)


    await db.transaction(async t => {

        // set as rejected
        await Transaction.update({ status : TransactionStatus.REJECTED }, {
            where: { id: req.body.transactionId },
            transaction: t
        })

        // return back the points to the sender
        const sender : User = await User.findOne({ where: {id: transaction.sender.id}, transaction: t})
        const pointsSum : number = sender.points + transaction.points

        await User.update({ points: pointsSum }, {
            where: {id: sender.id},
            transaction: t
        })

        transaction = await Transaction.findOne({ where: {id: transaction.id}, transaction: t, include: [{ all: true }]})
    })

    response.success(res, transactionView.one(transaction), 'Transaction Rejected')
}


export default { createTransaction, listTransactions, confirmTransaction, rejectTransaction}
