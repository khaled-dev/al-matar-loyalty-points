import { Request, Response } from 'express';
import Transaction, {TransactionModel} from '../models/transaction.model';
import response from "../http/response";
import jwt from "jsonwebtoken";
import User, {UserModel} from "../models/user.model";

interface ITransferRequest extends Request {
    body: {
        senderEmail: string;
        receiverEmail: string;
        points: number;
    };
}

export const createTransaction = async (req: ITransferRequest, res: Response) => {
    const { senderEmail, receiverEmail, points } = req.body;
    let authHeader : any = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    let decoded = jwt.verify(token, process.env.JWT_SECRET!)

    if (receiverEmail === decoded.email) return response.validation(res, {receiverEmail}, 'The transaction is made to yourself!!', 422)

    if (senderEmail !== decoded.email) return response.validation(res, {receiverEmail}, 'The sender email must be yours.', 422)

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


export default { createTransaction };
