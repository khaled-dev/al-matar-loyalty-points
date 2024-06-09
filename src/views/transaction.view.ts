import Transaction from '../models/transaction.model'

const one = (transaction: Transaction) => {
    return {
        ID: transaction.id,
        SenderEmail: transaction.sender.email,
        ReceiverEmail: transaction.receiver.email,
        Points: transaction.points,
        Status: transaction.status,
        CreatedAt: transaction.createdAt.toLocaleString(),
    }
}

const many = (transactions: Transaction[]) => {
    return transactions.map((transaction : Transaction) => {
        return {
            ID: transaction.id,
            SenderEmail: transaction.sender.email,
            ReceiverEmail: transaction.receiver.email,
            Points: transaction.points,
            Status: transaction.status,
            CreatedAt: transaction.createdAt.toLocaleString(),
        }
    })
}

export default {one, many}