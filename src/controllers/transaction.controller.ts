import { Request, Response } from 'express';
import Transaction, {TransactionModel} from '../models/transaction.model';
import response from "../http/response";

interface ITransferRequest extends Request {
    body: {
        senderEmail: string;
        receiverEmail: string;
        points: number;
    };
}

export const createTransaction = async (req: ITransferRequest, res: Response) => {
    const { senderEmail, receiverEmail, points } = req.body;

    const transaction : TransactionModel  = new Transaction({
        senderEmail,
        receiverEmail,
        points,
    });

    await transaction.save()

    response.success(res, {transaction}, 'Bad Request', 422)
};


export default { createTransaction };
