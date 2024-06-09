import Transaction from "../transaction.model";
import User from "../user.model";


export interface TransactionDTO {
    senderId: number,
    receiverId: number,
    points: number,
}


const create = async (transactionObject: TransactionDTO, user : User, t)  : Promise<Transaction>    => {

    const transaction : Transaction = await  Transaction.create({
        senderId: transactionObject.senderId,
        receiverId: transactionObject.receiverId,
        points: transactionObject.points,
    }, {transaction: t});

    const pointsMin : number = user.points - transactionObject.points;

    await User.update({ points: pointsMin }, {
        where: {id: user.id},
        transaction: t
    })

    return Transaction.findByPk(transaction.id, { include: [{ all: true }], transaction: t })
}

export default {create}