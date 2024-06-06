import { NextFunction, Request, Response } from 'express';
import Transaction, {TransactionStatus} from '../models/transaction.model';
import mongoose from "mongoose";


interface ITransferRequest extends Request {
    body: {
        senderEmail: string;
        receiverEmail: string;
        points: number;
    };
}

export const createTransaction = async (req: ITransferRequest, res: Response) => {
    const { senderEmail, receiverEmail, points } = req.body;

    const transaction  = new Transaction({
        senderEmail,
        receiverEmail,
        points,
    });

    return transaction
        .save()
        .then((transaction) => res.status(201).json({ transaction }))
        .catch((error) => res.status(500).json({ error }));
};


export default { createTransaction };
