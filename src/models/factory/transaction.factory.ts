import Transaction, {TransactionModel} from "../transaction.model";
import {UserModel} from "../user.model";


export interface TransactionDTO {
    senderEmail: string,
    receiverEmail: string,
    points: number,
}


const create = async (transactionObject: TransactionDTO , user : UserModel) : Promise<TransactionModel>  => {

    const transaction : TransactionModel  = new Transaction(transactionObject);
    await transaction.save()

    user.points -= transactionObject.points;
    await user.save()

    return transaction
}

export default {create}