import { Request, Response } from 'express';
import Transaction, {TransactionModel} from '../models/transaction.model';
import response from "../http/response";
import jwt from "jsonwebtoken";
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
 * List auth's transactions.
 *
 * @param req
 * @param res
 */
const listTransactions = async (req: Request, res: Response) => {
    const transactions : TransactionModel[] = await Transaction.where({ senderEmail: getAuthEmail(req) });

    //TODO: add resource-response
    response.success(res, {transactions}, 'Transaction list')
}

/**
 * Create transaction by the logged-in user.
 *
 * @param req
 * @param res
 */
const createTransaction = async (req: ICreateTransactionRequest, res: Response) => {
    const { senderEmail, receiverEmail, points } = req.body;
    const authEmail = getAuthEmail(req)

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

    response.success(res, {transaction}, 'points transferred successfully')
};

/**
 * Logged-in user can confirm his transaction made by him.
 *
 * @param req
 * @param res
 */
const confirmTransaction = async (req: IConfirmTransactionRequest, res: Response) => {
    // virfy it's sent by me

    // veirfy the pending state


    // virfy the time less than [10m]->env-var,


    // change state
    // sum the points

}



export  default { createTransaction, listTransactions, confirmTransaction};
