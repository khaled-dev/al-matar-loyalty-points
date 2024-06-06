import {TransactionModel} from '../models/transaction.model';

const one = (transaction) => {
    return {
        ID: transaction._id,
        SenderEmail: transaction.senderEmail,
        ReceiverEmail: transaction.senderEmail,
        Points: transaction.points,
        Status: transaction.status,
        CreatedAt: transaction.createdAt.toLocaleString(),
    }
}

const many = (transactions: TransactionModel[]) => {
    return transactions.map((transaction) => {
        return {
            ID: transaction._id,
            SenderEmail: transaction.senderEmail,
            ReceiverEmail: transaction.senderEmail,
            Points: transaction.points,
            Status: transaction.status,
            CreatedAt: transaction.createdAt.toLocaleString(),
        }
    })
}

export default {one, many}