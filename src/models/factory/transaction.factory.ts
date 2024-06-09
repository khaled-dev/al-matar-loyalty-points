import Transaction from "../transaction.model";
import User from "../user.model";


export interface TransactionDTO {
    senderId: number,
    receiverId: number,
    points: number,
}


const create = async (transactionObject: TransactionDTO , user : User)  : Promise<Transaction>    => {

    console.log(transactionObject)

    const transaction : Transaction = await  Transaction.create({
        senderId: transactionObject.senderId,
        receiverId: transactionObject.receiverId,
        points: transactionObject.points,
    } );

    user.points -= transactionObject.points;
    await user.save()

    return Transaction.findByPk(transaction.id, { include: [{ all: true }] })
}

export default {create}