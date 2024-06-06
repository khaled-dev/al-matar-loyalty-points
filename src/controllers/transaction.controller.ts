import {Request, Response} from 'express';
import Transaction, {TransactionModel, TransactionStatus} from '../models/transaction.model';
import response from "../http/response";
import jwt from "jsonwebtoken";
import transactionView from "../views/transaction.view";
import User, {UserModel} from "../models/user.model";

interface ICreateTransactionRequest extends Request {
    body: {
        senderEmail: string;
        receiverEmail: string;
        points: number;
    };
}

interface IConfirmTransactionRequest extends Request {
    body: {
        transactionId: string;
    };
}

const getAuthEmail = (req: Request) : string => {
    let authHeader : any = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    let decoded = jwt.verify(token, process.env.JWT_SECRET!)

    return decoded.email
}

/**
 * List user's transactions.
 *
 * @param req
 * @param res
 */
const listTransactions = async (req: Request, res: Response) => {
    const transactions : TransactionModel[] = await Transaction.where({ senderEmail: getAuthEmail(req) });

    response.success(res, transactionView.many(transactions), 'Transaction list')
}

/**
 * Create transaction by the logged-in user.
 *
 * @param req
 * @param res
 */
const createTransaction = async (req: ICreateTransactionRequest, res: Response) => {
    const { senderEmail, receiverEmail, points } = req.body;
    const authEmail : string = getAuthEmail(req)

    if (receiverEmail === authEmail) return response.validation(res, {receiverEmail}, 'The transaction is made to yourself!!', 422)
    
    if (senderEmail !== authEmail) return response.validation(res, {receiverEmail}, 'The sender email must be yours.', 422)

    const user : UserModel = await User.findOne({ email: senderEmail });
    if (user.points < points) return response.validation(res, {points}, 'You dont have enough points.', 422)


    const transaction : TransactionModel  = new Transaction({
        senderEmail,
        receiverEmail,
        points,
    });
    await transaction.save()

    user.points -= points;
    await user.save()

    response.success(res, transactionView.one(transaction), 'points transferred successfully')
};

/**
 * Logged-in user can confirm the transactions made by himself.
 *
 * @param req
 * @param res
 */
const confirmTransaction = async (req: IConfirmTransactionRequest, res: Response) => {
    const authEmail : string = getAuthEmail(req)
    const tenMinutesAgo : Date  = new Date(Date.now() - ( Number(process.env.TRANSACTION_EXPIRE_TIME) * 60 * 1000))
    const transaction : TransactionModel  = await Transaction.findOne({
        _id: req.body.transactionId,
        senderEmail: authEmail,
        status:  TransactionStatus.PENDING,
        createdAt: { $gt: tenMinutesAgo }
    });

    if (! transaction) return response.validation(res, {transactionId: req.body.transactionId}, 'You cant confirm this transaction.', 422)

    // set as confirmed
    transaction.status = TransactionStatus.CONFIRMED
    await transaction.save()

    // send the points
    const receiver : UserModel = await User.findOne({ email: transaction.receiverEmail });
    receiver.points += transaction.points
    await receiver.save()

    response.success(res, transactionView.one(transaction), 'Transaction Confirmed')
}

/**
 * Logged-in user can reject the transactions made by himself.
 *
 * @param req
 * @param res
 */
const rejectTransaction = async (req: IConfirmTransactionRequest, res: Response) => {
    const authEmail : string = getAuthEmail(req)
    const transaction : TransactionModel  = await Transaction.findOne({
        _id: req.body.transactionId,
        senderEmail: authEmail,
        status:  TransactionStatus.PENDING
    });

    // set as rejected
    transaction.status = TransactionStatus.REJECTED
    await transaction.save()

    // return back the points
    const receiver : UserModel = await User.findOne({ email: transaction.senderEmail });
    receiver.points += transaction.points
    await receiver.save()

    response.success(res, transactionView.one(transaction), 'Transaction Rejected')
}


export  default { createTransaction, listTransactions, confirmTransaction, rejectTransaction};
